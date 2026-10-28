"use client";

import { useShallow } from "zustand/react/shallow";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CreditCard, Lock, PlusCircle, ShoppingBag, Smartphone, Store, UtensilsCrossed } from "lucide-react";
import { useT } from "@/lib/i18n";
import { totals } from "@/lib/seed";
import { useDevice, useTable, useVenue } from "@/lib/store";
import type { OrderType, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, EmptyState, Input, Segmented, Select, Sheet, Stepper, Textarea, Toggle } from "@/components/ui";
import { useActiveOrder } from "@/components/customer/shared";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, L, m, n, lang } = useT();
  const cart = useDevice((s) => s.cart);
  const updateQty = useDevice((s) => s.updateQty);
  const clearCart = useDevice((s) => s.clearCart);
  const rememberOrder = useDevice((s) => s.rememberOrder);
  const settings = useVenue((s) => s.settings);
  const tables = useVenue(useShallow((s) => s.tables.filter((x) => x.active)));
  const table = useTable();
  const activeOrder = useActiveOrder();

  const [type, setType] = useState<OrderType>("dine_in");
  const [tableLabel, setTableLabel] = useState(table?.label ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<PaymentMethod>("cash");
  const [appendToOpen, setAppendToOpen] = useState(true);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const sum = totals(cart, settings, type);
  const appending = type === "dine_in" && !!activeOrder && appendToOpen;

  const validate = () => {
    if (type === "takeaway" && settings.requirePhoneTakeaway && (!name.trim() || phone.trim().length < 8)) return t("nameRequired");
    if (type === "dine_in" && !tableLabel && !appending) return t("tableRequired");
    return "";
  };

  const submit = (paid = false) => {
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }
    const v = useVenue.getState();
    let id: string;
    if (appending && activeOrder) {
      v.appendToOrder(activeOrder.id, cart);
      id = activeOrder.id;
    } else {
      const o = v.placeOrder({
        type,
        tableLabel,
        customerName: name,
        customerPhone: phone,
        notes,
        lines: cart,
        paymentMethod: pay,
        paid,
      });
      id = o.id;
    }
    rememberOrder(id);
    clearCart();
    router.push(`/track?id=${id}&new=1`);
  };

  const onPlace = () => {
    if (pay === "online" && !appending) {
      const err = validate();
      if (err) return setError(err);
      setPayOpen(true);
    } else submit();
  };

  const fakePay = () => {
    setProcessing(true);
    setTimeout(() => submit(true), 1600);
  };

  if (cart.length === 0)
    return (
      <div className="mx-auto min-h-dvh max-w-md bg-cream">
        <TopBar title={t("yourOrder")} />
        <EmptyState
          icon={<ShoppingBag className="size-7 text-muted" />}
          title={t("emptyCart")}
          sub={t("emptyCartSub")}
          action={<Link href="/m/cafe-x"><Button>{t("backToMenu")}</Button></Link>}
        />
      </div>
    );

  const payOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; enabled: boolean; badge?: string }[] = [
    { id: "cash", label: t("payCounter"), icon: <Banknote className="size-5" />, enabled: settings.payments.cash },
    { id: "card", label: t("payCard"), icon: <CreditCard className="size-5" />, enabled: settings.payments.cardAtTable },
    { id: "online", label: t("payOnline"), icon: <Smartphone className="size-5" />, enabled: true, badge: settings.payments.online ? undefined : t("comingSoon") },
  ];

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream pb-40">
      <TopBar title={t("yourOrder")} />

      <div className="space-y-4 px-4 pt-2">
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: "dine_in", label: <><UtensilsCrossed className="size-4" /> {t("dineIn")}</> },
            { value: "takeaway", label: <><Store className="size-4" /> {t("takeaway")}</> },
          ]}
        />

        {type === "dine_in" && activeOrder && (
          <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-50 p-4">
            <PlusCircle className="size-6 shrink-0 text-brand-700" />
            <div className="flex-1 text-sm">
              <p className="font-bold">{t("addToOpen")}</p>
              <p className="text-ink-soft">{t("addToOpenSub")} #{n(activeOrder.number)}</p>
            </div>
            <Toggle checked={appendToOpen} onChange={setAppendToOpen} />
          </div>
        )}

        {/* Items */}
        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="divide-y divide-line">
            {cart.map((l) => (
              <div key={l.lineId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{L(l.name)}</p>
                  {l.modifiers.length > 0 && <p className="mt-0.5 text-xs text-muted">{l.modifiers.map((md) => L(md.name)).join(" · ")}</p>}
                  {l.notes && <p className="mt-1 text-xs italic text-brand-700">“{l.notes}”</p>}
                  <p className="mt-1.5 text-sm font-bold">{m(l.unitPrice * l.quantity)}</p>
                </div>
                <Stepper size="sm" value={l.quantity} onChange={(q) => updateQty(l.lineId, q)} />
              </div>
            ))}
          </div>
          <Link href="/m/cafe-x" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            <PlusCircle className="size-4" /> {lang === "ar" ? "أضف أصنافًا أخرى" : "Add more items"}
          </Link>
        </section>

        {/* Details */}
        {!appending && (
          <section className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
            {type === "dine_in" ? (
              table ? (
                <div className="flex items-center gap-3 rounded-xl bg-sage-50 p-3 text-sage">
                  <UtensilsCrossed className="size-5" />
                  <p className="text-sm font-semibold">{t("youAreAt")} {table.label} · {table.zone}</p>
                </div>
              ) : (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">{t("selectTable")}</span>
                  <Select value={tableLabel} onChange={(e) => setTableLabel(e.target.value)}>
                    <option value="">—</option>
                    {tables.map((tb) => (
                      <option key={tb.id} value={tb.label}>{t("table")} {tb.label} · {tb.zone}</option>
                    ))}
                  </Select>
                </label>
              )
            ) : (
              <p className="text-sm text-muted">{t("pickupAt")}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{t("yourName")} {type === "dine_in" && <span className="font-normal text-muted">{t("optionalField")}</span>}</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sara" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{t("phone")} {type === "dine_in" && <span className="font-normal text-muted">{t("optionalField")}</span>}</span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01x xxxx xxxx" inputMode="tel" dir="ltr" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">{t("orderNotes")}</span>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("specialPlaceholder")} />
            </label>
          </section>
        )}

        {/* Payment */}
        {!appending && (
          <section className="rounded-2xl bg-white p-4 shadow-card">
            <p className="mb-3 font-bold">{t("payment")}</p>
            <div className="space-y-2">
              {payOptions.filter((p) => p.enabled).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPay(p.id)}
                  className={cn("flex w-full items-center gap-3 rounded-xl border-2 p-3 text-start transition", pay === p.id ? "border-brand bg-brand-50" : "border-line")}
                >
                  <span className={cn("grid size-10 place-items-center rounded-lg", pay === p.id ? "bg-brand text-white" : "bg-sand text-ink-soft")}>{p.icon}</span>
                  <span className="flex-1 text-sm font-semibold">{p.label}</span>
                  {p.badge && <Badge tone="blue">{p.badge}</Badge>}
                  <span className={cn("size-5 rounded-full border-2", pay === p.id ? "border-[6px] border-brand" : "border-line")} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Summary */}
        <section className="rounded-2xl bg-white p-4 text-sm shadow-card">
          <Row label={t("subtotal")} value={m(sum.subtotal)} />
          {sum.service > 0 && <Row label={`${t("service")} (${n(settings.servicePercent)}%)`} value={m(sum.service)} />}
          <Row label={`${t("vat")} (${n(settings.taxPercent)}%)`} value={m(sum.tax)} />
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>{t("total")}</span>
            <span>{m(sum.total)}</span>
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line bg-white/95 px-4 py-4 backdrop-blur">
        <Button size="lg" className="w-full" onClick={onPlace} disabled={!settings.acceptingOrders}>
          {appending ? t("addToOpen") : t("placeOrder")} · {m(sum.total)}
        </Button>
      </div>

      {/* Online payment stub */}
      <Sheet open={payOpen} onClose={() => !processing && setPayOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{t("payOnline")}</h3>
            <Badge tone="blue">Demo</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{t("total")}: <b className="text-ink">{m(sum.total)}</b></p>
          <div className="mt-5 space-y-3" dir="ltr">
            <Input defaultValue="4242 4242 4242 4242" placeholder={t("cardNumber")} />
            <div className="grid grid-cols-2 gap-3">
              <Input defaultValue="12/28" />
              <Input defaultValue="123" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {["Visa", "Mastercard", "Meeza", "Apple Pay", "Vodafone Cash"].map((w) => (
              <span key={w} className="rounded-md border border-line px-2 py-1 text-[10px] font-bold text-ink-soft">{w}</span>
            ))}
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={fakePay} disabled={processing}>
            {processing ? (
              <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {t("processing")}</>
            ) : (
              <><Lock className="size-4" /> {t("payNow")} {m(sum.total)}</>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">{t("securePay")} {settings.payments.provider} · PCI-DSS</p>
        </div>
      </Sheet>
    </div>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-cream/95 px-4 py-3 backdrop-blur">
      <Link href="/m/cafe-x" className="grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Back">
        <ArrowLeft className="size-5 rtl:rotate-180" />
      </Link>
      <h1 className="font-display text-xl font-semibold">{title}</h1>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-ink-soft">
      <span>{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
