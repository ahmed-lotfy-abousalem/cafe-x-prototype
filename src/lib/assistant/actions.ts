"use client";

/**
 * Assistant actions: the single place where the chat bots read and change app data.
 * The scripted demo engines (guest.ts / owner.ts) call these directly today; in
 * production the same functions become Claude Haiku 5.5 tools behind /api/chat.
 */

import { HOURLY, priceLine, salesHistory } from "@/lib/seed";
import { useDevice, useVenue } from "@/lib/store";
import type { Allergen, MenuItem, Order, Tag } from "@/lib/types";

/** Synthetic baselines shared with the admin dashboard so numbers always agree. */
export const TODAY_BASE = { revenue: 38_900, orders: 121 };
export const TOP_BASELINE: Record<string, number> = {
  spanish: 412, iced_spanish: 388, signature_burger: 241, cappuccino: 236,
  pancakes: 198, tiramisu: 176, wraps: 151, buddha: 120,
};

const venue = () => useVenue.getState();
const device = () => useDevice.getState();

/* ---------------- Menu ---------------- */

export function searchMenu(f: {
  categoryIds?: string[];
  tags?: Tag[];
  withoutAllergens?: Allergen[];
  maxPrice?: number;
  limit?: number;
}): MenuItem[] {
  const { items, categories } = venue();
  const activeCats = new Set(categories.filter((c) => c.active).map((c) => c.id));
  return items
    .filter((i) => i.available && activeCats.has(i.categoryId))
    .filter((i) => !f.categoryIds?.length || f.categoryIds.includes(i.categoryId))
    .filter((i) => !f.tags?.length || f.tags.some((t) => i.tags.includes(t)))
    .filter((i) => !f.withoutAllergens?.length || f.withoutAllergens.every((a) => !i.allergens.includes(a)))
    .filter((i) => f.maxPrice === undefined || i.price <= f.maxPrice)
    .sort((a, b) => Number(b.tags.includes("popular")) - Number(a.tags.includes("popular")))
    .slice(0, f.limit ?? 6);
}

export const getItem = (id: string) => venue().items.find((i) => i.id === id);

/** Adds an item with its default (first) option for each required group. */
export function addToCart(itemId: string, quantity = 1) {
  const item = getItem(itemId);
  if (!item || !item.available) return false;
  const defaults = item.modifierGroups.filter((g) => g.min > 0).map((g) => g.options[0].id);
  device().addToCart(priceLine(item, quantity, defaults));
  return true;
}

export const cartSummary = () => {
  const cart = device().cart;
  return { count: cart.reduce((a, l) => a + l.quantity, 0), total: cart.reduce((a, l) => a + l.unitPrice * l.quantity, 0) };
};

/* ---------------- Orders & service ---------------- */

export function myActiveOrder(): Order | undefined {
  const mine = device().myOrders;
  return venue()
    .orders.filter((o) => mine.includes(o.id))
    .sort((a, b) => b.createdAt - a.createdAt)
    .find((o) => o.status !== "cancelled");
}

export function orderEta(o: Order) {
  const prep = Math.max(...o.items.map((l) => getItem(l.itemId)?.prepMinutes ?? 8));
  return Math.max(1, Math.round((o.createdAt + (prep + 4) * 60_000 - Date.now()) / 60_000));
}

export function currentTableLabel() {
  const token = device().tableToken;
  return venue().tables.find((t) => t.token === token)?.label ?? myActiveOrder()?.tableLabel;
}

export function setTableByLabel(label: string) {
  const t = venue().tables.find((x) => x.active && x.label.toLowerCase() === label.toLowerCase());
  if (t) device().setTableToken(t.token);
  return t;
}

/** Open dine-in order on this device that new items can be added to. */
export const openDineInOrder = () => {
  const o = myActiveOrder();
  return o && o.type === "dine_in" && o.status !== "served" ? o : undefined;
};

/**
 * Sends the current cart to the kitchen (or appends it to the open order).
 * Totals are recomputed by the store from menu prices, never from chat text.
 */
export function placeOrderFromCart(): Order | undefined {
  const cart = device().cart;
  if (!cart.length) return undefined;
  const open = openDineInOrder();
  let order: Order | undefined;
  if (open) {
    venue().appendToOrder(open.id, cart);
    order = venue().orders.find((o) => o.id === open.id);
  } else {
    const table = currentTableLabel();
    if (!table) return undefined;
    order = venue().placeOrder({ type: "dine_in", tableLabel: table, lines: cart, paymentMethod: "cash" });
  }
  if (order) {
    device().rememberOrder(order.id);
    device().clearCart();
  }
  return order;
}

export function requestService(kind: "waiter" | "bill") {
  const label = currentTableLabel() ?? "?";
  venue().addRequest(label, kind);
  return label;
}

/* ---------------- Owner analytics ---------------- */

export function salesToday() {
  const live = venue().orders.filter(
    (o) => o.status !== "cancelled" && new Date(o.createdAt).toDateString() === new Date().toDateString(),
  );
  return {
    revenue: Math.round(TODAY_BASE.revenue + live.reduce((a, o) => a + o.total, 0)),
    orders: TODAY_BASE.orders + live.length,
  };
}

export function salesPeriod(days: number) {
  const hist = salesHistory(days);
  const t = salesToday();
  const revenue = hist.reduce((a, d) => a + d.revenue, 0) + t.revenue;
  const orders = hist.reduce((a, d) => a + d.orders, 0) + t.orders;
  return { revenue, orders, avgTicket: revenue / orders, yesterday: hist[hist.length - 1] };
}

export function topSellers(limit = 5) {
  const base = { ...TOP_BASELINE };
  venue().orders.forEach((o) => o.items.forEach((l) => (base[l.itemId] = (base[l.itemId] ?? 40) + l.quantity)));
  return Object.entries(base)
    .map(([id, qty]) => ({ item: getItem(id), qty }))
    .filter((x): x is { item: MenuItem; qty: number } => !!x.item)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export const busiestHour = () => HOURLY.reduce((a, b) => (b.v > a.v ? b : a));

export function liveOps() {
  const { orders, requests } = venue();
  const active = orders.filter((o) => ["received", "preparing", "ready"].includes(o.status));
  return {
    active: active.length,
    waiting: orders.filter((o) => o.status === "received").length,
    unpaid: orders.filter((o) => o.paymentStatus === "unpaid" && o.status !== "cancelled").reduce((a, o) => a + o.total, 0),
    requests: requests.filter((r) => !r.resolved),
  };
}

/* ---------------- Owner changes (always behind a confirm card) ---------------- */

export function setAvailability(itemId: string, available: boolean) {
  venue().setItemAvailable(itemId, available);
}

export function adjustPrices(itemIds: string[], delta: { amount?: number; percent?: number; setTo?: number }) {
  const v = venue();
  itemIds.forEach((id) => {
    const it = getItem(id);
    if (!it) return;
    const price =
      delta.setTo ?? Math.max(1, Math.round(delta.percent !== undefined ? it.price * (1 + delta.percent / 100) : it.price + (delta.amount ?? 0)));
    v.upsertItem({ ...it, price });
  });
}
