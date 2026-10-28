"use client";

import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight, BarChart3, ChefHat, Globe2, LayoutGrid, Link2, MonitorSmartphone, QrCode, RotateCcw, ShieldCheck, Smartphone, Zap,
} from "lucide-react";
import { useDevice, useVenue } from "@/lib/store";
import { Button, Logo } from "@/components/ui";

export default function Hub() {
  const router = useRouter();
  const login = useDevice((s) => s.login);
  const tables = useVenue((s) => s.tables);
  const resetDemo = useVenue((s) => s.resetDemo);
  const demoTable = tables.find((t) => t.label === "7") ?? tables[0];
  const guestUrl = `/l/cafe-x?t=${demoTable.token}`;
  const origin = window.location.origin;

  const as = (userId: string, href: string) => {
    login(userId);
    router.push(href);
  };

  const modules = [
    { icon: Smartphone, title: "Guest link tree", sub: "What the QR opens: socials, maps, and a big “Order Now”.", href: guestUrl, cta: "Open as Table 7" },
    { icon: MonitorSmartphone, title: "Digital menu & checkout", sub: "Categories, search, modifiers, cart, dine-in / takeaway, live tracking. AR/EN.", href: `/m/cafe-x?t=${demoTable.token}`, cta: "Open menu" },
    { icon: LayoutGrid, title: "Staff orders board", sub: "Live Kanban with sound alerts, payments, waiter calls, sold-out toggles.", onClick: () => as("u3", "/staff"), cta: "Sign in as cashier" },
    { icon: ChefHat, title: "Kitchen display", sub: "Dark, touch-first ticket screen with timers and an all-day count.", onClick: () => as("u5", "/staff/kitchen"), cta: "Sign in as kitchen" },
    { icon: BarChart3, title: "Admin & reports", sub: "Sales dashboard, orders history, CSV export.", onClick: () => as("u1", "/admin"), cta: "Sign in as owner" },
    { icon: QrCode, title: "Tables & QR codes", sub: "Per-table QR, PNG download, printable table tents, token rotation.", onClick: () => as("u1", "/admin/tables"), cta: "Manage tables" },
    { icon: Link2, title: "Link tree editor", sub: "Brand colour, cover, links and click stats with a live phone preview.", onClick: () => as("u1", "/admin/linktree"), cta: "Edit link tree" },
    { icon: Globe2, title: "Menu manager", sub: "Bilingual items, photos, options, schedules, CSV/Excel import.", onClick: () => as("u1", "/admin/menu"), cta: "Edit menu" },
  ];

  const script = [
    "Scan the Table 7 QR on the right with a phone (or click “Open as Table 7”).",
    "The branded link tree opens. Tap Order Now; the table is already detected.",
    "Customise an Iced Spanish Latte (oat milk, large) + a burger, then place the order.",
    "Switch to the staff board: the order lands instantly with a chime.",
    "Tap “Accept & start” → “Mark ready”. The guest's tracking screen updates live.",
    "From “Sold-out items”, switch off the Tiramisu. It's greyed out on the menu immediately.",
    "Open Admin → Tables to print QR table tents, and Link tree to restyle the page.",
  ];

  return (
    <div className="min-h-dvh bg-cream">
      <header className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-6">
        <Logo size={44} />
        <div className="leading-tight">
          <p className="font-display text-xl font-semibold">Café X</p>
          <p className="text-xs text-muted">Digital ordering · Prototype v0.1</p>
        </div>
        <span className="ms-auto hidden items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold text-sage sm:flex">
          <span className="size-2 animate-pulse rounded-full bg-sage" /> Interactive demo · sample data
        </span>
        <Button variant="ghost" size="sm" onClick={() => { resetDemo(); window.location.reload(); }}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pt-6 pb-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            <Zap className="size-3.5" /> Scan → Order → Served
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Your guests order from the table.<br />
            <span className="text-brand">Your team sees it instantly.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            A QR self-ordering system for Café X: a branded link tree, a beautiful Arabic/English menu, a live kitchen
            dashboard and an admin panel to run it all. No app to install.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => router.push(guestUrl)}>Start the guest journey <ArrowRight className="size-5" /></Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                login("u3");
                window.open(guestUrl, "guest", "width=430,height=900");
                router.push("/staff");
              }}
            >
              Side-by-side demo
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-sage" /> Server-checked prices</span>
            <span className="flex items-center gap-1.5"><Globe2 className="size-4 text-sage" /> Arabic RTL + English</span>
            <span className="flex items-center gap-1.5"><Smartphone className="size-4 text-sage" /> Works on any phone</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="hidden w-[300px] rounded-[44px] border-[9px] border-ink bg-ink shadow-float md:block">
            <iframe src={guestUrl} title="Guest preview" className="h-[600px] w-full rounded-[35px] bg-white" />
          </div>
          <div className="flex flex-col items-center rounded-3xl bg-white p-5 text-center shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Scan me</p>
            <div className="my-3 rounded-2xl border border-line p-3">
              <QRCodeSVG value={origin + guestUrl} size={150} fgColor="#2a1c14" />
            </div>
            <p className="font-bold">Table 7</p>
            <p className="mt-1 max-w-[180px] text-[11px] text-muted">
              {origin.includes("localhost") ? "Phone scan needs the network URL (e.g. http://192.168.x.x:3000) or a deployed link." : origin.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-display text-3xl font-semibold">Everything in the prototype</h2>
          <p className="mt-1 text-muted">Every screen is clickable. Data is shared live between browser tabs.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <button
                key={m.title}
                onClick={() => (m.onClick ? m.onClick() : router.push(m.href!))}
                className="group flex flex-col rounded-3xl border border-line bg-white p-5 text-start shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-ink text-cream transition group-hover:bg-brand"><m.icon className="size-5" /></span>
                <p className="mt-4 font-bold">{m.title}</p>
                <p className="mt-1 flex-1 text-sm text-muted">{m.sub}</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-bold text-brand-700">{m.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold">5-minute demo script</h2>
          <ol className="mt-6 space-y-4">
            {script.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
                <p className="pt-1 text-ink-soft">{s}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl bg-ink p-8 text-cream">
          <h3 className="font-display text-2xl font-semibold">How it fits together</h3>
          <div className="mt-6 space-y-3 text-sm">
            {[
              ["QR code on the table", "Opaque per-table token"],
              ["Link tree", "Brand, socials, Order Now"],
              ["Menu & checkout", "Mobile web app, AR/EN, no install"],
              ["Live order feed", "Real-time push to every staff screen"],
              ["Staff board + kitchen display", "Accept → Preparing → Ready → Served"],
              ["Admin panel", "Menu, tables, QR, staff, reports"],
            ].map(([a, b], i, arr) => (
              <div key={a}>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span className="font-semibold">{a}</span>
                  <span className="text-cream/60">{b}</span>
                </div>
                {i < arr.length - 1 && <div className="ms-6 h-3 w-px bg-white/20" />}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-cream/50">Production stack: Next.js · Supabase (Postgres, Auth, Realtime, Storage) · Vercel</p>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        Prototype for client review · all data is sample data · Café X is a placeholder brand
      </footer>
    </div>
  );
}
