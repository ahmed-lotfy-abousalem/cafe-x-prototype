"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BellRing, Check, ChefHat, ClipboardCheck, PartyPopper, Plus, Receipt, Store, UtensilsCrossed, XCircle } from "lucide-react";
import { statusHint, statusLabel, useT } from "@/lib/i18n";
import { useDevice, useVenue } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { clock, cn, useNow } from "@/lib/utils";
import { Badge, Button, LangToggle, Logo, useToast } from "@/components/ui";
import { GuestAssistant } from "@/components/chat/Assistants";

const FLOW: { s: OrderStatus; icon: React.ElementType }[] = [
  { s: "received", icon: ClipboardCheck },
  { s: "preparing", icon: ChefHat },
  { s: "ready", icon: PartyPopper },
  { s: "served", icon: UtensilsCrossed },
];

export default function TrackPage() {
  return (
    <Suspense>
      <Track />
    </Suspense>
  );
}

function Track() {
  const { t, L, m, n, lang } = useT();
  const params = useSearchParams();
  const id = params.get("id");
  const isNew = params.get("new") === "1";
  const order = useVenue((s) => s.orders.find((o) => o.id === id));
  const myOrders = useDevice((s) => s.myOrders);
  const allOrders = useVenue((s) => s.orders);
  const now = useNow(10_000);
  const toast = useToast(2600);
  const prevStatus = useRef(order?.status);

  // Small nudge when the kitchen moves the order forward (arrives via cross-tab sync).
  useEffect(() => {
    if (order && prevStatus.current && prevStatus.current !== order.status) {
      toast.show(`${t("orderNumber")} #${n(order.number)}: ${L(statusLabel[order.status])}`);
      if (navigator.vibrate) navigator.vibrate(120);
    }
    prevStatus.current = order?.status;
  }, [order?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order)
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center p-6 text-center">
        <div>
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-bold">Order not found</p>
          <Link href="/m/cafe-x" className="mt-4 inline-block"><Button>{t("backToMenu")}</Button></Link>
        </div>
      </div>
    );

  const cancelled = order.status === "cancelled";
  const step = FLOW.findIndex((f) => f.s === order.status);
  const prep = Math.max(...order.items.map((i) => useVenue.getState().items.find((x) => x.id === i.itemId)?.prepMinutes ?? 8));
  const eta = Math.max(1, Math.round((order.createdAt + (prep + 4) * 60_000 - now) / 60_000));
  const others = allOrders.filter((o) => myOrders.includes(o.id) && o.id !== order.id);

  const help = (kind: "waiter" | "bill") => {
    useVenue.getState().addRequest(order.tableLabel ?? "Takeaway", kind);
    toast.show(kind === "waiter" ? t("waiterOnWay") : t("billOnWay"));
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream pb-28">
      <header className="flex items-center gap-2 px-4 py-3">
        <Link href="/m/cafe-x" className="grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Back">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <Logo size={30} />
        <p className="flex-1 font-display text-lg font-semibold">Café X</p>
        <LangToggle />
      </header>

      {/* Hero card */}
      <div className={cn("relative mx-4 overflow-hidden rounded-3xl p-6 text-center text-cream shadow-float", cancelled ? "bg-red-900" : order.status === "ready" ? "bg-sage" : "bg-ink")}>
        <div className="pointer-events-none absolute -top-16 -end-16 size-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 size-56 rounded-full bg-white/5" />
        {isNew && step === 0 && <p className="relative mb-2 animate-pop text-sm font-semibold text-brand-100">🎉 {t("thanks")}</p>}
        <p className="relative text-sm uppercase tracking-[0.2em] text-cream/70">{t("orderNumber")}</p>
        <p className="relative font-display text-7xl font-semibold tabular-nums">#{n(order.number)}</p>
        <div className="relative mt-3 flex items-center justify-center gap-2 text-sm">
          {order.type === "dine_in" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"><UtensilsCrossed className="size-3.5" /> {t("table")} {order.tableLabel}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1"><Store className="size-3.5" /> {t("takeaway")}</span>
          )}
          <span className="rounded-full bg-white/10 px-3 py-1">{clock(order.createdAt)}</span>
        </div>
        <p className="relative mt-5 text-xl font-bold">
          {cancelled ? <span className="inline-flex items-center gap-2"><XCircle className="size-6" /> {t("cancelled")}</span> : L(statusLabel[order.status])}
        </p>
        <p className="relative mt-1 text-sm text-cream/75">{L(statusHint[order.status])}</p>
        {(order.status === "received" || order.status === "preparing") && (
          <p className="relative mt-4 inline-block rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white">
            {t("estReady")} ~{n(eta)} {t("min")}
          </p>
        )}
      </div>

      {/* Stepper */}
      {!cancelled && (
        <div className="mx-4 mt-4 rounded-3xl bg-white p-5 shadow-card">
          <div className="relative flex justify-between">
            <div className="absolute inset-x-6 top-5 h-1 rounded-full bg-sand" />
            <div className="absolute start-6 top-5 h-1 rounded-full bg-brand transition-all duration-700" style={{ width: `calc((100% - 3rem) * ${Math.max(0, step) / 3})` }} />
            {FLOW.map((f, i) => {
              const done = i < step;
              const cur = i === step;
              const Icon = f.icon;
              return (
                <div key={f.s} className="relative z-10 flex w-16 flex-col items-center gap-2 text-center">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-full border-2 transition-all duration-500",
                      done && "border-brand bg-brand text-white",
                      cur && "scale-110 border-brand bg-white text-brand shadow-[0_0_0_6px_rgb(200_116_47/0.15)]",
                      !done && !cur && "border-line bg-white text-muted",
                    )}
                  >
                    {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className={cn("size-5", cur && "animate-pulse")} />}
                  </span>
                  <span className={cn("text-[11px] font-semibold leading-tight", cur ? "text-ink" : "text-muted")}>{L(statusLabel[f.s])}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 space-y-1.5 border-t border-line pt-4">
            {order.history.map((h, i) => (
              <p key={i} className="flex justify-between text-xs text-muted">
                <span>{L(statusLabel[h.status])}</span>
                <span className="tabular-nums">{clock(h.at)}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <Link href="/m/cafe-x" className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-xs font-semibold shadow-card"><Plus className="size-5 text-brand" /> {t("orderMore")}</Link>
        <button onClick={() => help("waiter")} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-xs font-semibold shadow-card"><BellRing className="size-5 text-brand" /> {t("callWaiter")}</button>
        <button onClick={() => help("bill")} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-xs font-semibold shadow-card"><Receipt className="size-5 text-brand" /> {t("requestBill")}</button>
      </div>

      {/* Receipt */}
      <div className="mx-4 mt-4 rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-bold">{t("yourOrder")}</p>
          <Badge tone={order.paymentStatus === "paid" ? "green" : "amber"}>{order.paymentStatus === "paid" ? t("paid") : t("unpaid")}</Badge>
        </div>
        <div className="mt-3 space-y-2.5">
          {order.items.map((l) => (
            <div key={l.lineId} className="flex gap-3 text-sm">
              <span className="font-bold text-brand-700">{n(l.quantity)}×</span>
              <div className="flex-1">
                <p className="font-semibold">{L(l.name)}</p>
                {l.modifiers.length > 0 && <p className="text-xs text-muted">{l.modifiers.map((x) => L(x.name)).join(" · ")}</p>}
              </div>
              <span className="font-medium">{m(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-dashed border-line pt-3 text-sm text-ink-soft">
          <p className="flex justify-between"><span>{t("subtotal")}</span><span>{m(order.subtotal)}</span></p>
          {order.service > 0 && <p className="flex justify-between"><span>{t("service")}</span><span>{m(order.service)}</span></p>}
          <p className="flex justify-between"><span>{t("vat")}</span><span>{m(order.tax)}</span></p>
          <p className="flex justify-between pt-1 text-base font-bold text-ink"><span>{t("total")}</span><span>{m(order.total)}</span></p>
        </div>
      </div>

      {others.length > 0 && (
        <div className="mx-4 mt-4">
          <p className="mb-2 px-1 text-sm font-bold text-muted">{t("myOrders")}</p>
          <div className="space-y-2">
            {others.map((o) => (
              <a key={o.id} href={`/track?id=${o.id}`} className="flex items-center justify-between rounded-2xl bg-white p-4 text-sm shadow-card">
                <span className="font-bold">#{n(o.number)}</span>
                <span className="text-muted">{clock(o.createdAt)}</span>
                <Badge>{L(statusLabel[o.status])}</Badge>
                <span className="font-semibold">{m(o.total)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted">{lang === "ar" ? "يتم التحديث تلقائيًا" : "This page updates live"} · <span className="inline-block size-1.5 animate-pulse rounded-full bg-sage align-middle" /></p>
      <GuestAssistant className="bottom-6 sm:end-[calc(50%-14rem+1rem)]" />
      {toast.node}
    </div>
  );
}
