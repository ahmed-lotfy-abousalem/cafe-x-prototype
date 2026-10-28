"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  priceLine,
  seedCategories,
  seedItems,
  seedLinks,
  seedOrders,
  seedRequests,
  seedSettings,
  seedStaff,
  seedTables,
  totals,
} from "./seed";
import type {
  Category,
  Lang,
  LinkItem,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  OrderType,
  PaymentMethod,
  ServiceRequest,
  Settings,
  StaffUser,
  Table,
} from "./types";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/* ============================================================
   Venue store: the "backend". Persisted to localStorage and
   re-hydrated on the `storage` event so every open tab
   (customer phone, kitchen screen, admin) stays in sync.
   ============================================================ */

type VenueData = {
  seededAt: number;
  nextNumber: number;
  settings: Settings;
  categories: Category[];
  items: MenuItem[];
  tables: Table[];
  links: LinkItem[];
  staff: StaffUser[];
  orders: Order[];
  requests: ServiceRequest[];
};

export type NewOrder = {
  type: OrderType;
  tableLabel?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  lines: OrderLine[];
  paymentMethod?: PaymentMethod;
  paid?: boolean;
};

type VenueActions = {
  placeOrder: (o: NewOrder) => Order;
  appendToOrder: (orderId: string, lines: OrderLine[]) => void;
  setStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  markPaid: (orderId: string, method: PaymentMethod) => void;
  toggleLineDone: (orderId: string, lineId: string) => void;
  updateOrderLines: (orderId: string, lines: OrderLine[], reason: string) => void;
  simulateOrder: () => void;

  setItemAvailable: (id: string, available: boolean) => void;
  upsertItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  importItems: (items: MenuItem[]) => void;
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, dir: -1 | 1) => void;

  upsertTable: (t: Table) => void;
  deleteTable: (id: string) => void;
  rotateToken: (id: string) => void;

  upsertLink: (l: LinkItem) => void;
  deleteLink: (id: string) => void;
  moveLink: (id: string, dir: -1 | 1) => void;
  clickLink: (id: string) => void;

  upsertStaff: (u: StaffUser) => void;
  deleteStaff: (id: string) => void;

  updateSettings: (s: Partial<Settings>) => void;

  addRequest: (tableLabel: string, kind: ServiceRequest["kind"]) => void;
  resolveRequest: (id: string) => void;

  resetDemo: () => void;
};

function freshData(): VenueData {
  const now = Date.now();
  return {
    seededAt: now,
    nextNumber: 32,
    settings: seedSettings,
    categories: seedCategories,
    items: seedItems,
    tables: seedTables,
    links: seedLinks,
    staff: seedStaff.map((u, i) => ({ ...u, lastActive: now - i * 17 * 60_000 })),
    orders: seedOrders(now),
    requests: seedRequests(now),
  };
}

const move = <T extends { id: string }>(arr: T[], id: string, dir: -1 | 1) => {
  const i = arr.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

const upsert = <T extends { id: string }>(arr: T[], v: T) =>
  arr.some((x) => x.id === v.id) ? arr.map((x) => (x.id === v.id ? v : x)) : [...arr, v];

export const useVenue = create<VenueData & VenueActions>()(
  persist(
    (set, get) => ({
      ...freshData(),

      placeOrder: (o) => {
        const { settings, nextNumber } = get();
        const now = Date.now();
        const order: Order = {
          id: uid("ord"),
          number: nextNumber,
          type: o.type,
          tableLabel: o.type === "dine_in" ? o.tableLabel : undefined,
          customerName: o.customerName || undefined,
          customerPhone: o.customerPhone || undefined,
          notes: o.notes || undefined,
          items: o.lines,
          ...totals(o.lines, settings, o.type),
          status: "received",
          paymentStatus: o.paid ? "paid" : "unpaid",
          paymentMethod: o.paymentMethod,
          createdAt: now,
          updatedAt: now,
          history: [{ status: "received", at: now }],
        };
        set((s) => ({ orders: [order, ...s.orders], nextNumber: s.nextNumber + 1 }));
        return order;
      },

      appendToOrder: (orderId, lines) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== orderId) return o;
            const items = [...o.items, ...lines];
            const now = Date.now();
            return {
              ...o,
              items,
              ...totals(items, s.settings, o.type),
              status: "received",
              updatedAt: now,
              addedRounds: (o.addedRounds ?? 0) + 1,
              history: [...o.history, { status: "received", at: now }],
            };
          }),
        })),

      setStatus: (orderId, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: Date.now(), history: [...o.history, { status, at: Date.now() }] }
              : o,
          ),
        })),

      cancelOrder: (orderId, reason) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "cancelled",
                  cancelReason: reason,
                  updatedAt: Date.now(),
                  history: [...o.history, { status: "cancelled", at: Date.now() }],
                }
              : o,
          ),
        })),

      markPaid: (orderId, method) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: "paid", paymentMethod: method, updatedAt: Date.now() } : o,
          ),
        })),

      toggleLineDone: (orderId, lineId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: o.items.map((l) => (l.lineId === lineId ? { ...l, done: !l.done } : l)) }
              : o,
          ),
        })),

      updateOrderLines: (orderId, lines, reason) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: lines, ...totals(lines, s.settings, o.type), notes: [o.notes, `Edited: ${reason}`].filter(Boolean).join(" · "), updatedAt: Date.now() }
              : o,
          ),
        })),

      simulateOrder: () => {
        const { items, tables } = get();
        const avail = items.filter((i) => i.available);
        const pick = () => avail[Math.floor(Math.random() * avail.length)];
        const n = 1 + Math.floor(Math.random() * 3);
        const lines = Array.from({ length: n }, () => {
          const it = pick();
          const mods = it.modifierGroups.filter((g) => g.min > 0).map((g) => g.options[Math.floor(Math.random() * g.options.length)].id);
          return priceLine(it, 1 + Math.floor(Math.random() * 2), mods);
        });
        const takeaway = Math.random() < 0.3;
        const activeTables = tables.filter((t) => t.active);
        const names = ["Mona", "Hassan", "Nadine", "Tarek", "Salma", "Ali", "Farida"];
        get().placeOrder({
          type: takeaway ? "takeaway" : "dine_in",
          tableLabel: takeaway ? undefined : activeTables[Math.floor(Math.random() * activeTables.length)].label,
          customerName: takeaway ? names[Math.floor(Math.random() * names.length)] : undefined,
          customerPhone: takeaway ? "+20 11 5555 0101" : undefined,
          lines,
        });
      },

      setItemAvailable: (id, available) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, available } : i)) })),
      upsertItem: (item) => set((s) => ({ items: upsert(s.items, item) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      importItems: (items) => set((s) => ({ items: [...s.items, ...items] })),
      upsertCategory: (c) => set((s) => ({ categories: upsert(s.categories, c) })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id), items: s.items.filter((i) => i.categoryId !== id) })),
      moveCategory: (id, dir) => set((s) => ({ categories: move(s.categories, id, dir) })),

      upsertTable: (t) => set((s) => ({ tables: upsert(s.tables, t) })),
      deleteTable: (id) => set((s) => ({ tables: s.tables.filter((t) => t.id !== id) })),
      rotateToken: (id) =>
        set((s) => ({ tables: s.tables.map((t) => (t.id === id ? { ...t, token: uid("tbl") } : t)) })),

      upsertLink: (l) => set((s) => ({ links: upsert(s.links, l) })),
      deleteLink: (id) => set((s) => ({ links: s.links.filter((l) => l.id !== id) })),
      moveLink: (id, dir) => set((s) => ({ links: move(s.links, id, dir) })),
      clickLink: (id) => set((s) => ({ links: s.links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l)) })),

      upsertStaff: (u) => set((s) => ({ staff: upsert(s.staff, u) })),
      deleteStaff: (id) => set((s) => ({ staff: s.staff.filter((u) => u.id !== id) })),

      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      addRequest: (tableLabel, kind) =>
        set((s) => ({ requests: [{ id: uid("rq"), tableLabel, kind, at: Date.now(), resolved: false }, ...s.requests] })),
      resolveRequest: (id) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, resolved: true } : r)) })),

      resetDemo: () => set(freshData()),
    }),
    {
      name: "cafex-venue",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/* ============================================================
   Device store: things that belong to one browser tab
   (the guest's cart, their orders, language, staff session).
   ============================================================ */

export type CartLine = OrderLine;

type DeviceState = {
  lang: Lang;
  tableToken?: string;
  cart: CartLine[];
  myOrders: string[];
  staffUserId?: string;
  soundOn: boolean;
  setLang: (l: Lang) => void;
  setTableToken: (t?: string) => void;
  addToCart: (l: CartLine) => void;
  updateQty: (lineId: string, qty: number) => void;
  clearCart: () => void;
  rememberOrder: (id: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  setSound: (on: boolean) => void;
};

export const useDevice = create<DeviceState>()(
  persist(
    (set) => ({
      lang: "en",
      cart: [],
      myOrders: [],
      soundOn: true,
      setLang: (lang) => set({ lang }),
      setTableToken: (tableToken) => set({ tableToken }),
      addToCart: (l) => set((s) => ({ cart: [...s.cart, l] })),
      updateQty: (lineId, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.lineId !== lineId) : s.cart.map((l) => (l.lineId === lineId ? { ...l, quantity: qty } : l)),
        })),
      clearCart: () => set({ cart: [] }),
      rememberOrder: (id) => set((s) => ({ myOrders: [id, ...s.myOrders.filter((x) => x !== id)] })),
      login: (staffUserId) => set({ staffUserId }),
      logout: () => set({ staffUserId: undefined }),
      setSound: (soundOn) => set({ soundOn }),
    }),
    {
      name: "cafex-device",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);

export function useTable() {
  const token = useDevice((s) => s.tableToken);
  const tables = useVenue((s) => s.tables);
  return token ? tables.find((t) => t.token === token && t.active) : undefined;
}
