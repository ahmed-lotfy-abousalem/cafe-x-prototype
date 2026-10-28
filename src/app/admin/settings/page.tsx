"use client";

import { BellRing, Clock, CreditCard, Globe, Landmark, MessageCircle, Percent, Power, RotateCcw, Store } from "lucide-react";
import { totals } from "@/lib/seed";
import { useVenue } from "@/lib/store";
import { egp } from "@/lib/utils";
import { Badge, Button, Card, Field, Input, Segmented, Select, Toggle, useToast } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";

function Section({ icon: Icon, title, sub, children }: { icon: React.ElementType; title: string; sub: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
        <div><p className="font-bold">{title}</p><p className="text-sm text-muted">{sub}</p></div>
      </div>
      {children}
    </Card>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <div><p className="text-sm font-semibold">{label}</p>{sub && <p className="text-xs text-muted">{sub}</p>}</div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const v = useVenue();
  const s = v.settings;
  const up = v.updateSettings;
  const toast = useToast();
  const example = totals([{ lineId: "x", itemId: "x", name: { en: "", ar: "" }, unitPrice: 500, quantity: 1, modifiers: [], notes: "" }], s, "dine_in");

  return (
    <>
      <PageHeader title="Settings" sub="Venue details, pricing rules, ordering and payments." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={Power} title="Online ordering" sub="Pause QR ordering at busy times or after closing.">
          <Row label="Accepting orders" sub={s.acceptingOrders ? "Guests can order from their phones" : "Menu is view-only for guests"}>
            <Toggle checked={s.acceptingOrders} onChange={(x) => up({ acceptingOrders: x })} />
          </Row>
          <Row label="Payment flow" sub="Pay-first reduces walk-outs for takeaway">
            <Segmented value={s.paymentFlow} onChange={(x) => up({ paymentFlow: x })} className="w-64" options={[{ value: "pay_after", label: "Pay after" }, { value: "pay_first", label: "Pay first" }]} />
          </Row>
          <Row label="Require name & phone for takeaway" sub="Optional OTP verification in Phase 2">
            <Toggle checked={s.requirePhoneTakeaway} onChange={(x) => up({ requirePhoneTakeaway: x })} />
          </Row>
          <Row label="New-order sound on staff devices"><Toggle checked={s.soundAlerts} onChange={(x) => up({ soundAlerts: x })} /></Row>
        </Section>

        <Section icon={Percent} title="Tax & service" sub="Server-side calculation: customers can't tamper with totals.">
          <div className="grid grid-cols-3 gap-3">
            <Field label="VAT %"><Input type="number" value={s.taxPercent} onChange={(e) => up({ taxPercent: Number(e.target.value) })} /></Field>
            <Field label="Service %"><Input type="number" value={s.servicePercent} onChange={(e) => up({ servicePercent: Number(e.target.value) })} /></Field>
            <Field label="Currency">
              <Select value={s.currency} onChange={(e) => up({ currency: e.target.value })}>
                {["EGP", "SAR", "AED", "USD"].map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Row label="Apply service charge to takeaway"><Toggle checked={s.serviceOnTakeaway} onChange={(x) => up({ serviceOnTakeaway: x })} /></Row>
          <div className="mt-2 rounded-xl bg-sand/60 p-3 text-xs text-ink-soft">
            Example dine-in bill of <b>{egp(500)}</b>: service {egp(example.service)} + VAT {egp(example.tax)} = <b className="text-ink">{egp(example.total)}</b>
          </div>
        </Section>

        <Section icon={Store} title="Venue" sub="Shown on the link tree, receipts and Google profile.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Venue name"><Input value={s.venueName} onChange={(e) => up({ venueName: e.target.value })} /></Field>
            <Field label="Phone"><Input value={s.phone} onChange={(e) => up({ phone: e.target.value })} /></Field>
            <Field label="Address (English)"><Input value={s.address.en} onChange={(e) => up({ address: { ...s.address, en: e.target.value } })} /></Field>
            <Field label="العنوان (عربي)"><Input dir="rtl" value={s.address.ar} onChange={(e) => up({ address: { ...s.address, ar: e.target.value } })} /></Field>
          </div>
        </Section>

        <Section icon={Globe} title="Language" sub="Arabic & English with full right-to-left layout.">
          <Row label="Default menu language">
            <Segmented value={s.defaultLang} onChange={(x) => up({ defaultLang: x })} className="w-56" options={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
          </Row>
          <Row label="Let guests switch language"><Toggle checked onChange={() => {}} /></Row>
        </Section>

        <Section icon={Clock} title="Opening hours" sub="Used for the “Open now” badge and to schedule breakfast/evening items.">
          <div className="space-y-2">
            {s.hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3">
                <span className="w-10 text-sm font-semibold">{h.day}</span>
                <Input type="time" value={h.open} disabled={h.closed} onChange={(e) => up({ hours: s.hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)) })} className="py-1.5" />
                <span className="text-muted">–</span>
                <Input type="time" value={h.close} disabled={h.closed} onChange={(e) => up({ hours: s.hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)) })} className="py-1.5" />
                <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">
                  <Toggle size="sm" checked={!h.closed} onChange={(x) => up({ hours: s.hours.map((y, j) => (j === i ? { ...y, closed: !x } : y)) })} /> Open
                </label>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={CreditCard} title="Payments" sub="Swap providers without touching order logic.">
          <Row label="Cash / pay at counter"><Toggle checked={s.payments.cash} onChange={(x) => up({ payments: { ...s.payments, cash: x } })} /></Row>
          <Row label="Card at the table" sub="Waiter brings the POS terminal"><Toggle checked={s.payments.cardAtTable} onChange={(x) => up({ payments: { ...s.payments, cardAtTable: x } })} /></Row>
          <Row label="Online payment" sub="Cards, Meeza, Apple Pay, mobile wallets">
            <div className="flex items-center gap-2"><Badge tone="blue">Phase 2</Badge><Toggle checked={s.payments.online} onChange={(x) => up({ payments: { ...s.payments, online: x } })} /></div>
          </Row>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Paymob", "Kashier", "Fawry", "Stripe"].map((p) => (
              <button key={p} onClick={() => up({ payments: { ...s.payments, provider: p } })} className={`rounded-xl border p-3 text-sm font-bold transition ${s.payments.provider === p ? "border-brand bg-brand-50 text-brand-700" : "border-line hover:bg-sand/50"}`}>
                <Landmark className="mx-auto mb-1 size-5" />{p}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={BellRing} title="Notifications" sub="Keep guests and staff in the loop.">
          <Row label="WhatsApp order confirmation" sub="Send order # and live tracking link"><div className="flex items-center gap-2"><Badge tone="blue">Phase 2</Badge><Toggle checked={false} onChange={() => {}} /></div></Row>
          <Row label="SMS when takeaway is ready"><div className="flex items-center gap-2"><Badge tone="blue">Phase 2</Badge><Toggle checked={false} onChange={() => {}} /></div></Row>
          <Row label="Daily sales summary to owner" sub="Email at closing time"><Toggle checked onChange={() => {}} /></Row>
        </Section>

        <Section icon={MessageCircle} title="Demo data" sub="Prototype only: restore the original sample menu and orders.">
          <Button variant="outline" onClick={() => { if (confirm("Reset all demo data?")) { v.resetDemo(); toast.show("Demo data restored"); } }}>
            <RotateCcw className="size-4" /> Reset demo data
          </Button>
        </Section>
      </div>
      {toast.node}
    </>
  );
}
