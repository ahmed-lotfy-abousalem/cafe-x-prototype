"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { statusLabel } from "@/lib/i18n";
import { useVenue } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { clock, cn, downloadText, egp } from "@/lib/utils";
import { Badge, Button, Card, Select, STATUS_TONE } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import OrderDetail from "@/components/staff/OrderDetail";

const STATUSES: (OrderStatus | "all")[] = ["all", "received", "preparing", "ready", "served", "cancelled"];

export default function OrdersPage() {
  const orders = useVenue((s) => s.orders);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [type, setType] = useState("");
  const [pay, setPay] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (!type || o.type === type) &&
          (!pay || o.paymentStatus === pay) &&
          (!q || `${o.number} ${o.customerName ?? ""} ${o.customerPhone ?? ""} ${o.tableLabel ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [orders, status, type, pay, q],
  );

  const exportCsv = () => {
    const rows = [
      ["order_number", "created_at", "type", "table", "customer", "phone", "items", "subtotal", "service", "vat", "total", "payment", "status"],
      ...list.map((o) => [
        o.number, new Date(o.createdAt).toISOString(), o.type, o.tableLabel ?? "", o.customerName ?? "", o.customerPhone ?? "",
        o.items.map((l) => `${l.quantity}x ${l.name.en}`).join(" | "), o.subtotal, o.service, o.tax, o.total, o.paymentStatus, o.status,
      ]),
    ];
    downloadText(`cafex-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
  };

  const revenue = list.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0);

  return (
    <>
      <PageHeader title="Orders" sub={`${list.length} orders · ${egp(revenue)} revenue`} actions={<Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const count = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatus(s)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition", status === s ? "bg-ink text-cream" : "bg-white text-ink-soft shadow-card hover:text-ink")}>
              {s === "all" ? "All" : statusLabel[s].en} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-line p-4">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, customer, phone, table" className="h-10 w-full rounded-xl border border-line ps-9 pe-3 text-sm outline-none focus:border-brand" />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-40 py-0">
            <option value="">All types</option>
            <option value="dine_in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
          </Select>
          <Select value={pay} onChange={(e) => setPay(e.target.value)} className="h-10 w-40 py-0">
            <option value="">Any payment</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                {["Order", "Placed", "Customer / table", "Items", "Total", "Payment", "Status"].map((h) => <th key={h} className="px-5 py-3 text-start font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((o) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer hover:bg-sand/30">
                  <td className="px-5 py-3.5 font-bold">#{o.number}</td>
                  <td className="px-5 py-3.5 text-muted">{clock(o.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {o.type === "dine_in" ? <span className="font-semibold">Table {o.tableLabel}</span> : <span><b>{o.customerName}</b> <span className="text-muted">· takeaway</span></span>}
                  </td>
                  <td className="max-w-72 truncate px-5 py-3.5 text-muted">{o.items.map((l) => `${l.quantity}× ${l.name.en}`).join(", ")}</td>
                  <td className="px-5 py-3.5 font-semibold">{egp(o.total)}</td>
                  <td className="px-5 py-3.5"><Badge tone={o.paymentStatus === "paid" ? "green" : "amber"}>{o.paymentStatus === "paid" ? `Paid · ${o.paymentMethod}` : "Unpaid"}</Badge></td>
                  <td className="px-5 py-3.5"><Badge tone={STATUS_TONE[o.status]}>{statusLabel[o.status].en}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="p-10 text-center text-muted">No orders match these filters.</p>}
        </div>
      </Card>
      <OrderDetail order={orders.find((o) => o.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </>
  );
}
