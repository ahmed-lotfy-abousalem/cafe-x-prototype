"use client";

import { useShallow } from "zustand/react/shallow";
import { useMemo, useState } from "react";
import { BellRing, Check, ChefHat, ClipboardList, PackageX, PartyPopper, Receipt, Search, UtensilsCrossed } from "lucide-react";
import { useVenue } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { ago, cn, minutesSince, useNow } from "@/lib/utils";
import { Badge, Button, Drawer, ItemImage, Select, Toggle } from "@/components/ui";
import { OrderCard } from "@/components/staff/OrderCard";
import OrderDetail from "@/components/staff/OrderDetail";
import { StaffHeader, useNewOrderAlert, useRequireStaff } from "@/components/staff/StaffShell";

const COLUMNS: { status: OrderStatus; title: string; icon: React.ElementType; accent: string }[] = [
  { status: "received", title: "New", icon: ClipboardList, accent: "bg-sky-500" },
  { status: "preparing", title: "Preparing", icon: ChefHat, accent: "bg-amber-500" },
  { status: "ready", title: "Ready", icon: PartyPopper, accent: "bg-sage" },
  { status: "served", title: "Completed", icon: Check, accent: "bg-ink-soft" },
];

export default function StaffBoard() {
  const user = useRequireStaff();
  const orders = useVenue((s) => s.orders);
  const tables = useVenue((s) => s.tables);
  const requests = useVenue(useShallow((s) => s.requests.filter((r) => !r.resolved)));
  const resolveRequest = useVenue((s) => s.resolveRequest);
  const now = useNow(15_000);
  const fresh = useNewOrderAlert();

  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "dine_in" | "takeaway">("all");
  const [table, setTable] = useState("");
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [stockOpen, setStockOpen] = useState(false);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (type === "all" || o.type === type) &&
          (!table || o.tableLabel === table) &&
          (!unpaidOnly || o.paymentStatus === "unpaid") &&
          (!q || `${o.number} ${o.customerName ?? ""} ${o.tableLabel ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [orders, type, table, unpaidOnly, q],
  );

  if (!user) return null;

  const col = (s: OrderStatus): Order[] => {
    const list = filtered.filter((o) => o.status === s || (s === "served" && showCancelled && o.status === "cancelled"));
    return s === "served" ? list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12) : list.sort((a, b) => a.createdAt - b.createdAt);
  };
  const active = orders.filter((o) => ["received", "preparing", "ready"].includes(o.status));
  const avgWait = active.length ? Math.round(active.reduce((a, o) => a + minutesSince(o.createdAt, now), 0) / active.length) : 0;
  const unpaidTotal = orders.filter((o) => o.paymentStatus === "unpaid" && o.status !== "cancelled").reduce((a, o) => a + o.total, 0);

  return (
    <div className="min-h-dvh bg-[#f6f1ea]">
      <StaffHeader user={user} />

      {/* Service requests */}
      {requests.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-brand/20 bg-brand-50 px-4 py-2.5 lg:px-6">
          {requests.map((r) => (
            <div key={r.id} className="flex animate-pop items-center gap-2 rounded-full bg-white py-1 ps-3 pe-1 text-sm shadow-sm">
              {r.kind === "waiter" ? <BellRing className="size-4 animate-bounce text-brand" /> : <Receipt className="size-4 text-sage" />}
              <b>Table {r.tableLabel}</b>
              <span className="text-ink-soft">{r.kind === "waiter" ? "is calling a waiter" : "requested the bill"}</span>
              <span className="text-xs text-muted">· {ago(r.at, now)}</span>
              <button onClick={() => resolveRequest(r.id)} className="ms-1 rounded-full bg-ink px-3 py-1 text-xs font-bold text-cream">Done</button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 lg:px-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order #, name, table…" className="h-10 w-full rounded-xl border border-line bg-white ps-9 pe-3 text-sm outline-none focus:border-brand" />
        </div>
        <div className="flex rounded-xl border border-line bg-white p-1">
          {(["all", "dine_in", "takeaway"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", type === t ? "bg-ink text-cream" : "text-ink-soft")}>
              {t === "all" ? "All" : t === "dine_in" ? "Dine-in" : "Takeaway"}
            </button>
          ))}
        </div>
        <Select value={table} onChange={(e) => setTable(e.target.value)} className="h-10 w-36 py-0">
          <option value="">All tables</option>
          {tables.map((t) => <option key={t.id} value={t.label}>Table {t.label}</option>)}
        </Select>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold">
          <Toggle size="sm" checked={unpaidOnly} onChange={setUnpaidOnly} /> Unpaid only
        </label>
        <div className="ms-auto flex gap-2">
          <Button variant="outline" onClick={() => setStockOpen(true)}>
            <PackageX className="size-4" /> Sold-out items
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4 md:grid-cols-4 lg:px-6">
        {[
          { label: "Active orders", value: active.length },
          { label: "Avg. wait", value: `${avgWait} min` },
          { label: "Open requests", value: requests.length },
          { label: "Unpaid balance", value: `EGP ${Math.round(unpaidTotal).toLocaleString()}` },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-white px-4 py-3 shadow-card">
            <p className="text-xs font-semibold text-muted">{k.label}</p>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:p-6 xl:grid-cols-4">
        {COLUMNS.map((c) => {
          const list = col(c.status);
          return (
            <section key={c.status} className="flex min-h-[50vh] flex-col rounded-3xl bg-sand/70 p-3">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("size-2.5 rounded-full", c.accent)} />
                <c.icon className="size-4 text-ink-soft" />
                <h2 className="font-bold">{c.title}</h2>
                <span className="ms-auto rounded-full bg-white px-2.5 py-0.5 text-sm font-bold tabular-nums">{list.length}</span>
                {c.status === "served" && (
                  <button onClick={() => setShowCancelled(!showCancelled)} className="text-xs font-semibold text-muted underline-offset-2 hover:underline">
                    {showCancelled ? "Hide" : "Show"} cancelled
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {list.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} flash={fresh.includes(o.id)} onOpen={() => setOpenId(o.id)} />
                ))}
                {list.length === 0 && (
                  <div className="grid place-items-center rounded-2xl border-2 border-dashed border-line py-10 text-sm text-muted">
                    <UtensilsCrossed className="mb-2 size-6 opacity-40" />
                    Nothing here
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <OrderDetail order={orders.find((o) => o.id === openId) ?? null} onClose={() => setOpenId(null)} />
      <StockDrawer open={stockOpen} onClose={() => setStockOpen(false)} />
    </div>
  );
}

function StockDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useVenue((s) => s.items);
  const categories = useVenue((s) => s.categories);
  const setAvail = useVenue((s) => s.setItemAvailable);
  const [q, setQ] = useState("");
  const out = items.filter((i) => !i.available).length;
  return (
    <Drawer open={open} onClose={onClose} title="Menu availability">
      <p className="text-sm text-muted">Switch an item off and it disappears from every customer&apos;s menu instantly.</p>
      <div className="mt-3 flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" className="h-10 flex-1 rounded-xl border border-line px-3 text-sm outline-none focus:border-brand" />
        <Badge tone={out ? "red" : "green"}>{out} sold out</Badge>
      </div>
      {categories.map((c) => {
        const list = items.filter((i) => i.categoryId === c.id && i.name.en.toLowerCase().includes(q.toLowerCase()));
        if (!list.length) return null;
        return (
          <div key={c.id} className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{c.icon} {c.name.en}</p>
            <div className="divide-y divide-line rounded-2xl border border-line">
              {list.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3">
                  <ItemImage src={i.image} alt="" className={cn("size-10 rounded-lg", !i.available && "grayscale")} />
                  <span className={cn("flex-1 text-sm font-semibold", !i.available && "text-muted line-through")}>{i.name.en}</span>
                  {!i.available && <Badge tone="red">Sold out</Badge>}
                  <Toggle checked={i.available} onChange={(v) => setAvail(i.id, v)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Drawer>
  );
}
