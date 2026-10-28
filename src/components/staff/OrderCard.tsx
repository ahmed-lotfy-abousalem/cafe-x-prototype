"use client";

import { ArrowRight, Banknote, Check, ChefHat, Clock, MessageSquareText, Store, UtensilsCrossed } from "lucide-react";
import { useVenue } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { clock, cn, egp, minutesSince } from "@/lib/utils";
import { Badge } from "@/components/ui";

export const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; icon: React.ElementType; cls: string }>> = {
  received: { to: "preparing", label: "Accept & start", icon: ChefHat, cls: "bg-ink text-cream hover:bg-ink/90" },
  preparing: { to: "ready", label: "Mark ready", icon: Check, cls: "bg-sage text-white hover:brightness-110" },
  ready: { to: "served", label: "Served", icon: ArrowRight, cls: "bg-brand text-white hover:bg-brand-600" },
};

export function OrderCard({ order, now, flash, onOpen }: { order: Order; now: number; flash?: boolean; onOpen: () => void }) {
  const setStatus = useVenue((s) => s.setStatus);
  const age = minutesSince(order.createdAt, now);
  const late = order.status !== "served" && order.status !== "cancelled" && age >= 20;
  const warn = !late && order.status !== "served" && order.status !== "cancelled" && age >= 10;
  const next = NEXT[order.status];
  const count = order.items.reduce((a, l) => a + l.quantity, 0);

  return (
    <div
      className={cn(
        "animate-pop overflow-hidden rounded-2xl border bg-white shadow-card transition hover:shadow-md",
        flash ? "animate-flash border-brand" : "border-line",
        order.status === "cancelled" && "opacity-60",
      )}
    >
      <button onClick={onOpen} className="block w-full p-4 text-start">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tabular-nums">#{order.number}</span>
              {flash && <Badge tone="brand" className="bg-brand text-white">NEW</Badge>}
              {(order.addedRounds ?? 0) > 0 && order.status === "received" && <Badge tone="blue">+ Added items</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {order.type === "dine_in" ? (
                <Badge tone="dark"><UtensilsCrossed className="size-3" /> Table {order.tableLabel}</Badge>
              ) : (
                <Badge tone="blue"><Store className="size-3" /> Takeaway · {order.customerName}</Badge>
              )}
              <Badge tone={order.paymentStatus === "paid" ? "green" : "amber"}>
                {order.paymentStatus === "paid" ? <Check className="size-3" /> : <Banknote className="size-3" />}
                {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </div>
          <div className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold tabular-nums", late ? "bg-red-50 text-red-700" : warn ? "bg-amber-50 text-amber-700" : "bg-sand text-ink-soft")}>
            <Clock className="size-3.5" />
            {order.status === "served" || order.status === "cancelled" ? clock(order.createdAt) : `${age}m`}
          </div>
        </div>

        <ul className="mt-3 space-y-1.5 text-sm">
          {order.items.slice(0, 4).map((l) => (
            <li key={l.lineId} className={cn("flex gap-2", l.done && "text-muted line-through")}>
              <span className="w-5 shrink-0 font-bold text-brand-700">{l.quantity}×</span>
              <span className="min-w-0">
                <span className="font-semibold">{l.name.en}</span>
                {l.modifiers.length > 0 && <span className="block truncate text-xs text-muted">{l.modifiers.map((m) => m.name.en).join(", ")}</span>}
                {l.notes && <span className="block text-xs font-semibold text-brand-700">“{l.notes}”</span>}
              </span>
            </li>
          ))}
          {order.items.length > 4 && <li className="ps-7 text-xs font-semibold text-muted">+{order.items.length - 4} more lines</li>}
        </ul>

        {order.notes && (
          <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-800">
            <MessageSquareText className="size-4 shrink-0" /> {order.notes}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>{count} items</span>
          <span className="text-sm font-bold text-ink">{egp(order.total)}</span>
        </div>
      </button>

      {next && (
        <button
          onClick={() => setStatus(order.id, next.to)}
          className={cn("flex w-full items-center justify-center gap-2 py-3 text-sm font-bold transition", next.cls)}
        >
          <next.icon className="size-4" /> {next.label}
        </button>
      )}
    </div>
  );
}
