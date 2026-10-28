"use client";

import { Check, ChefHat, Clock, MessageSquareText, Store, UtensilsCrossed } from "lucide-react";
import { useVenue } from "@/lib/store";
import { cn, minutesSince, useNow } from "@/lib/utils";
import { StaffHeader, useNewOrderAlert, useRequireStaff } from "@/components/staff/StaffShell";

/** Kitchen Display System: big, dark, touch-first. Tap a line to tick it off. */
export default function KitchenDisplay() {
  const user = useRequireStaff();
  const orders = useVenue((s) => s.orders);
  const setStatus = useVenue((s) => s.setStatus);
  const toggleLine = useVenue((s) => s.toggleLineDone);
  const now = useNow(10_000);
  const fresh = useNewOrderAlert();
  if (!user) return null;

  const queue = orders
    .filter((o) => o.status === "received" || o.status === "preparing")
    .sort((a, b) => a.createdAt - b.createdAt);
  const ready = orders.filter((o) => o.status === "ready");

  // All-day count: how many of each item are in the queue right now.
  const allDay = Object.entries(
    queue.flatMap((o) => o.items.filter((l) => !l.done)).reduce<Record<string, number>>((acc, l) => {
      acc[l.name.en] = (acc[l.name.en] ?? 0) + l.quantity;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-dvh bg-kds text-cream">
      <StaffHeader dark user={user} />
      <div className="flex gap-4 p-4 lg:p-6">
        <div className="grid flex-1 auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {queue.map((o) => {
            const age = minutesSince(o.createdAt, now);
            const tone = age >= 20 ? "border-red-500 bg-red-500" : age >= 10 ? "border-amber-400 bg-amber-400" : "border-emerald-400 bg-emerald-400";
            const allDone = o.items.every((l) => l.done);
            return (
              <div key={o.id} className={cn("flex animate-pop flex-col overflow-hidden rounded-2xl border-t-8 bg-kds-card", tone.split(" ")[0], fresh.includes(o.id) && "animate-flash")}>
                <div className="flex items-center justify-between px-4 pt-3">
                  <span className="text-3xl font-extrabold tabular-nums">#{o.number}</span>
                  <span className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-kds", tone.split(" ")[1])}>
                    <Clock className="size-4" /> {age}m
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 pt-1 text-sm text-cream/70">
                  {o.type === "dine_in" ? <><UtensilsCrossed className="size-4" /> Table {o.tableLabel}</> : <><Store className="size-4" /> Takeaway · {o.customerName}</>}
                  <span className={cn("ms-auto rounded-md px-2 py-0.5 text-xs font-bold uppercase", o.status === "received" ? "bg-sky-500/20 text-sky-300" : "bg-amber-400/20 text-amber-300")}>
                    {o.status === "received" ? "New" : "Cooking"}
                  </span>
                </div>
                <ul className="mt-3 flex-1 divide-y divide-kds-line border-y border-kds-line">
                  {o.items.map((l) => (
                    <li key={l.lineId}>
                      <button onClick={() => toggleLine(o.id, l.lineId)} className={cn("flex w-full gap-3 px-4 py-3 text-start transition hover:bg-white/5", l.done && "opacity-40")}>
                        <span className={cn("grid size-7 shrink-0 place-items-center rounded-md border-2 text-base font-extrabold", l.done ? "border-emerald-400 bg-emerald-400 text-kds" : "border-cream/30")}>
                          {l.done ? <Check className="size-4" strokeWidth={3} /> : l.quantity}
                        </span>
                        <span className="min-w-0">
                          <span className={cn("block text-lg leading-tight font-bold", l.done && "line-through")}>{l.name.en}</span>
                          {l.modifiers.length > 0 && <span className="mt-0.5 block text-sm text-amber-200/90">{l.modifiers.map((m) => m.name.en).join(" · ")}</span>}
                          {l.notes && <span className="mt-0.5 block text-sm font-bold text-red-300">⚠ {l.notes}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {o.notes && (
                  <p className="flex gap-2 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
                    <MessageSquareText className="size-4 shrink-0" /> {o.notes}
                  </p>
                )}
                {o.status === "received" ? (
                  <button onClick={() => setStatus(o.id, "preparing")} className="flex items-center justify-center gap-2 bg-sky-600 py-4 text-lg font-bold hover:bg-sky-500">
                    <ChefHat className="size-5" /> Start
                  </button>
                ) : (
                  <button onClick={() => setStatus(o.id, "ready")} className={cn("flex items-center justify-center gap-2 py-4 text-lg font-bold", allDone ? "bg-emerald-500 text-kds hover:bg-emerald-400" : "bg-white/10 hover:bg-white/15")}>
                    <Check className="size-5" /> Bump · Ready
                  </button>
                )}
              </div>
            );
          })}
          {queue.length === 0 && (
            <div className="col-span-full grid place-items-center py-32 text-center text-cream/50">
              <ChefHat className="size-14" />
              <p className="mt-4 text-xl font-bold">All caught up</p>
              <p className="text-sm">New tickets will appear here with a chime.</p>
            </div>
          )}
        </div>

        <aside className="hidden w-72 shrink-0 space-y-4 lg:block">
          <div className="rounded-2xl bg-kds-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-cream/50">All-day count</p>
            <ul className="mt-3 space-y-2">
              {allDay.map(([name, qty]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold tabular-nums">{qty}</span>
                </li>
              ))}
              {!allDay.length && <li className="text-sm text-cream/40">—</li>}
            </ul>
          </div>
          <div className="rounded-2xl bg-kds-card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-cream/50">Ready for pickup</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ready.map((o) => (
                <button key={o.id} onClick={() => setStatus(o.id, "served")} title="Mark served" className="rounded-xl bg-emerald-500/15 px-3 py-2 text-lg font-extrabold text-emerald-300 hover:bg-emerald-500/25">
                  #{o.number}
                </button>
              ))}
              {!ready.length && <span className="text-sm text-cream/40">—</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
