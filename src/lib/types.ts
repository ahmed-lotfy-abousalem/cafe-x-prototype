export type Lang = "en" | "ar";
export type L10n = { en: string; ar: string };

export type Tag = "popular" | "new" | "spicy" | "vegan" | "vegetarian" | "chef";
export type Allergen = "dairy" | "gluten" | "eggs" | "nuts" | "soy" | "fish";

export type ModifierOption = { id: string; name: L10n; price: number };
export type ModifierGroup = {
  id: string;
  name: L10n;
  min: number;
  max: number;
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: L10n;
  description: L10n;
  price: number;
  image: string;
  available: boolean;
  tags: Tag[];
  allergens: Allergen[];
  calories: number;
  prepMinutes: number;
  schedule: "all_day" | "breakfast" | "evening";
  modifierGroups: ModifierGroup[];
};

export type Category = { id: string; name: L10n; icon: string; active: boolean };

export type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "served" | "cancelled";

/** Statuses of an order still in play, and those a guest may still ask to change. */
export const ACTIVE_STATUSES: OrderStatus[] = ["pending", "accepted", "preparing", "ready"];
export const REQUESTABLE_STATUSES: OrderStatus[] = ["pending", "accepted"];
/** Abuse limit: requests a guest can send per order (one open at a time). */
export const MAX_GUEST_REQUESTS = 3;

/** A guest's request to change or cancel; guests never edit an order directly. */
export type ChangeRequest = {
  id: string;
  kind: "change" | "cancel";
  /** For a change: the lines the guest wants instead (quantities lowered or lines removed). */
  lines?: OrderLine[];
  note?: string;
  status: "pending" | "approved" | "declined";
  reason?: string;
  /** Online-paid orders only: what staff decided for the money (no automatic refunds). */
  resolution?: "refund" | "credit";
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
};

/** One line in the order's audit log: who did what, when. */
export type OrderEvent = { at: number; who: string; text: string };
export type OrderType = "dine_in" | "takeaway";
export type PaymentMethod = "cash" | "card" | "wallet" | "online";

export type OrderLine = {
  lineId: string;
  itemId: string;
  name: L10n;
  unitPrice: number;
  quantity: number;
  modifiers: { id: string; name: L10n; price: number }[];
  notes: string;
  done?: boolean;
};

export type Order = {
  id: string;
  number: number;
  type: OrderType;
  tableLabel?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderLine[];
  subtotal: number;
  service: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid";
  paymentMethod?: PaymentMethod;
  createdAt: number;
  updatedAt: number;
  history: { status: OrderStatus; at: number }[];
  cancelReason?: string;
  addedRounds?: number;
  requests?: ChangeRequest[];
  events?: OrderEvent[];
};

export type Table = {
  id: string;
  label: string;
  token: string;
  zone: "Indoor" | "Terrace" | "Window" | "Counter";
  seats: number;
  active: boolean;
};

export type LinkIcon =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "maps"
  | "phone"
  | "website"
  | "delivery";

export type LinkItem = {
  id: string;
  label: L10n;
  url: string;
  icon: LinkIcon;
  active: boolean;
  clicks: number;
};

export type Role = "owner" | "manager" | "cashier" | "kitchen" | "waiter";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastActive: number;
  color: string;
};

export type ServiceRequest = {
  id: string;
  tableLabel: string;
  kind: "waiter" | "bill";
  at: number;
  resolved: boolean;
};

export type DayHours = { day: string; open: string; close: string; closed: boolean };

export type Settings = {
  venueName: string;
  tagline: L10n;
  address: L10n;
  phone: string;
  currency: string;
  taxPercent: number;
  servicePercent: number;
  serviceOnTakeaway: boolean;
  acceptingOrders: boolean;
  requirePhoneTakeaway: boolean;
  paymentFlow: "pay_after" | "pay_first";
  brandColor: string;
  coverImage: string;
  defaultLang: Lang;
  hours: DayHours[];
  payments: { cash: boolean; cardAtTable: boolean; online: boolean; provider: string };
  soundAlerts: boolean;
};
