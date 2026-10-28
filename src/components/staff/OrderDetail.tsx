"use client";

import { useState } from "react";
import { Ban, Banknote, CreditCard, Pencil, Printer, Smartphone, Trash2 } from "lucide-react";
import { statusLabel } from "@/lib/i18n";
import { useVenue } from "@/lib/store";
import type { Order, OrderLine, OrderStatus, PaymentMethod } from "@/lib/types";
import { clock, cn, egp } from "@/lib/utils";
import { Badge, Button, Modal, Select, STATUS_TONE, Stepper, Textarea } from "@/components/ui";
import { NEXT } from "./OrderCard";

const REASONS = ["Customer request", "Item out of stock", "Duplicate order", "Kitchen error", "Customer left"];

export default function OrderDetail({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <Modal open={!!order} onClose={onClose} title={order ? `Order #${order.number}` : ""} wide>
      {order && <Body key={order.id} order={order} onClose={onClose} />}
    </Modal>
  );
}

function Body({ order, onClose }: { order: Order; onClose: () => void }) {
  const v = useVenue();
  const live = v.orders.find((o) => o.id === order.id) ?? order;
  const [mode, setMode] = useState<"view" | "edit" | "cancel">("view");
  const [lines, setLines] = useState<OrderLine[]>(live.items);
  const [reason, setReason] = useState(REASONS[0]);
  const [other, setOther] = useState("");
  const next = NEXT[live.status];

  const payBtn = (m: PaymentMethod, label: string, Icon: React.ElementType) => (
    <Button variant="outline" size="sm" onClick={() => v.markPaid(live.id, m)}>
      <Icon className="size-4" /> {label}
    </Button>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[live.status]}>{statusLabel[live.status].en}</Badge>
          <Badge tone="dark">{live.type === "dine_in" ? `Dine-in · Table ${live.tableLabel}` : "Takeaway"}</Badge>
          <Badge tone={live.paymentStatus === "paid" ? "green" : "amber"}>
            {live.paymentStatus === "paid" ? `Paid · ${live.paymentMethod}` : "Unpaid"}
          </Badge>
          <span className="text-xs text-muted">Placed {clock(live.createdAt)}</span>
        </div>
        {(live.customerName || live.customerPhone) && (
          <p className="mt-3 text-sm">
            <b>{live.customerName}</b> {live.customerPhone && <span className="text-muted">· {live.customerPhone}</span>}
          </p>
        )}

        {mode === "edit" ? (
          <div className="mt-4 space-y-2">
            {lines.map((l) => (
              <div key={l.lineId} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{l.name.en}</p>
                  <p className="text-xs text-muted">{egp(l.unitPrice)} each</p>
                </div>
                <Stepper size="sm" value={l.quantity} min={1} onChange={(q) => setLines((ls) => ls.map((x) => (x.lineId === l.lineId ? { ...x, quantity: q } : x)))} />
                <button className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" onClick={() => setLines((ls) => ls.filter((x) => x.lineId !== l.lineId))} aria-label="Remove line">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </Select>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  v.updateOrderLines(live.id, lines, reason);
                  setMode("view");
                }}
                disabled={!lines.length}
              >
                Save changes
              </Button>
              <Button variant="ghost" onClick={() => { setLines(live.items); setMode("view"); }}>Discard</Button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {live.items.map((l) => (
              <li key={l.lineId} className="flex items-start gap-3 p-3 text-sm">
                <span className="font-bold text-brand-700">{l.quantity}×</span>
                <div className="flex-1">
                  <p className="font-semibold">{l.name.en} <span className="font-normal text-muted">· {l.name.ar}</span></p>
                  {l.modifiers.length > 0 && <p className="text-xs text-muted">{l.modifiers.map((m) => `${m.name.en}${m.price ? ` (+${m.price})` : ""}`).join(", ")}</p>}
                  {l.notes && <p className="text-xs font-semibold text-brand-700">“{l.notes}”</p>}
                </div>
                <span className="font-semibold">{egp(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        {live.notes && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">📝 {live.notes}</p>}
        {live.cancelReason && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">Cancelled: {live.cancelReason}</p>}

        {mode === "cancel" && (
          <div className="mt-4 space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
            <p className="font-semibold text-red-800">Cancel this order?</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button key={r} onClick={() => setReason(r)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", reason === r ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-white text-red-700")}>{r}</button>
              ))}
            </div>
            <Textarea rows={2} placeholder="Add a note (optional)" value={other} onChange={(e) => setOther(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => { v.cancelOrder(live.id, other ? `${reason}: ${other}` : reason); setMode("view"); }}>Confirm cancel</Button>
              <Button variant="ghost" onClick={() => setMode("view")}>Keep order</Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Timeline</p>
          <ol className="space-y-2 border-s-2 border-line ps-4">
            {live.history.map((h, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -start-[23px] top-1.5 size-3 rounded-full border-2 border-white bg-brand" />
                <b>{statusLabel[h.status].en}</b> <span className="text-muted">· {clock(h.at)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <Receipt order={live} />
        {next && (
          <Button className="w-full" variant="dark" onClick={() => v.setStatus(live.id, next.to)}>
            <next.icon className="size-4" /> {next.label}
          </Button>
        )}
        {live.status !== "cancelled" && live.paymentStatus === "unpaid" && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Mark as paid</p>
            <div className="flex flex-wrap gap-2">
              {payBtn("cash", "Cash", Banknote)}
              {payBtn("card", "Card", CreditCard)}
              {payBtn("wallet", "Wallet", Smartphone)}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print ticket</Button>
          {!["served", "cancelled"].includes(live.status) && (
            <>
              <Button variant="outline" size="sm" onClick={() => setMode("edit")}><Pencil className="size-4" /> Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => setMode("cancel")}><Ban className="size-4" /> Cancel</Button>
            </>
          )}
        </div>
        <Select value={live.status} onChange={(e) => v.setStatus(live.id, e.target.value as OrderStatus)} aria-label="Override status">
          {(["received", "preparing", "ready", "served"] as OrderStatus[]).map((s) => <option key={s} value={s}>Set status: {statusLabel[s].en}</option>)}
        </Select>
        <Button variant="ghost" className="w-full" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

/** 80mm thermal-printer style ticket; also what `window.print()` outputs. */
export function Receipt({ order }: { order: Order }) {
  const s = useVenue((st) => st.settings);
  return (
    <div className="print-area rounded-xl border border-dashed border-line bg-[#fffdf9] p-4 font-mono text-[11px] leading-relaxed text-ink">
      <div className="text-center">
        <p className="text-sm font-bold">{s.venueName.toUpperCase()}</p>
        <p>{s.address.en}</p>
        <p>{s.phone}</p>
        <p className="my-2 border-y border-dashed border-ink/30 py-1 text-base font-bold">
          #{order.number} · {order.type === "dine_in" ? `TABLE ${order.tableLabel}` : "TAKEAWAY"}
        </p>
        <p>{new Date(order.createdAt).toLocaleString("en-GB")}</p>
      </div>
      <div className="mt-2 space-y-1">
        {order.items.map((l) => (
          <div key={l.lineId}>
            <div className="flex justify-between gap-2">
              <span>{l.quantity}x {l.name.en}</span>
              <span>{(l.unitPrice * l.quantity).toFixed(2)}</span>
            </div>
            {l.modifiers.map((m) => <p key={m.id} className="ps-3 opacity-70">+ {m.name.en}</p>)}
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-dashed border-ink/30 pt-1">
        <p className="flex justify-between"><span>Subtotal</span><span>{order.subtotal.toFixed(2)}</span></p>
        {order.service > 0 && <p className="flex justify-between"><span>Service {s.servicePercent}%</span><span>{order.service.toFixed(2)}</span></p>}
        <p className="flex justify-between"><span>VAT {s.taxPercent}%</span><span>{order.tax.toFixed(2)}</span></p>
        <p className="flex justify-between text-xs font-bold"><span>TOTAL {s.currency}</span><span>{order.total.toFixed(2)}</span></p>
        <p className="mt-1 text-center">{order.paymentStatus === "paid" ? `PAID · ${order.paymentMethod?.toUpperCase()}` : "PAYMENT DUE"}</p>
      </div>
      <p className="mt-2 text-center opacity-70">Thank you · شكراً لزيارتكم</p>
    </div>
  );
}
