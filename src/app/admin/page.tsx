"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Clock, Download, ReceiptText, ShoppingBag, Store, TrendingUp, UtensilsCrossed } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { statusLabel } from "@/lib/i18n";
import { HOURLY, salesHistory } from "@/lib/seed";
import { useVenue } from "@/lib/store";
import { ago, cn, egp, useNow } from "@/lib/utils";
import { Badge, Button, Card, ItemImage, STATUS_TONE, Segmented } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { useStaffUser } from "@/components/staff/StaffShell";
import { TODAY_BASE, TOP_BASELINE } from "@/lib/assistant/actions";

const BRAND = "#c8742f";

export default function Overview() {
  const orders = useVenue((s) => s.orders);
  const items = useVenue((s) => s.items);
  const now = useNow(30_000);
  const [range, setRange] = useState<"7" | "14" | "30">("14");
  const user = useStaffUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = orders.filter((o) => o.status !== "cancelled" && new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = today.reduce((a, o) => a + o.total, 0);

  const series = useMemo(() => {
    const hist = salesHistory(Number(range)).map((d) => ({
      day: d.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue: d.revenue,
      orders: d.orders,
    }));
    // Today = synthetic morning baseline + live prototype orders, so new demo orders move the chart.
    hist.push({ day: "Today", revenue: Math.round(TODAY_BASE.revenue + todayRevenue), orders: TODAY_BASE.orders + today.length });
    return hist;
  }, [range, todayRevenue, today.length]);

  const prev = series[series.length - 2];
  const cur = series[series.length - 1];
  const totalRevenue = series.reduce((a, d) => a + d.revenue, 0);
  const totalOrders = series.reduce((a, d) => a + d.orders, 0);

  // Top items: live quantities + a deterministic baseline so the list looks lived-in.
  const top = useMemo(() => {
    const base = { ...TOP_BASELINE };
    orders.forEach((o) => o.items.forEach((l) => (base[l.itemId] = (base[l.itemId] ?? 40) + l.quantity)));
    return Object.entries(base)
      .map(([id, qty]) => ({ item: items.find((i) => i.id === id), qty }))
      .filter((x) => x.item)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [orders, items]);
  const maxQty = top[0]?.qty ?? 1;

  const dine = orders.filter((o) => o.type === "dine_in").length;
  const dinePct = Math.round((dine / Math.max(1, orders.length)) * 100);

  const kpis = [
    { label: "Revenue today", value: egp(cur.revenue), delta: ((cur.revenue - prev.revenue) / prev.revenue) * 100, icon: TrendingUp },
    { label: "Orders today", value: String(cur.orders), delta: ((cur.orders - prev.orders) / prev.orders) * 100, icon: ShoppingBag },
    { label: "Avg. ticket", value: egp(cur.revenue / cur.orders), delta: 4.2, icon: ReceiptText },
    { label: "Avg. prep time", value: "11 min", delta: -8.5, icon: Clock, invert: true },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name.split(" ")[0] ?? "there"} 👋`}
        sub={`Here's how ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} is going.`}
        actions={
          <>
            <Segmented value={range} onChange={setRange} className="w-60" options={[{ value: "7", label: "7d" }, { value: "14", label: "14d" }, { value: "30", label: "30d" }]} />
            <Button variant="outline"><Download className="size-4" /> Export</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const good = k.invert ? k.delta < 0 : k.delta >= 0;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted">{k.label}</p>
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><k.icon className="size-[18px]" /></span>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums">{k.value}</p>
              <p className={cn("mt-1 flex items-center gap-1 text-xs font-semibold", good ? "text-sage" : "text-red-600")}>
                {k.delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {Math.abs(k.delta).toFixed(1)}% <span className="font-normal text-muted">vs yesterday</span>
              </p>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-bold">Revenue</p>
              <p className="text-sm text-muted">Last {range} days · {egp(totalRevenue)} from {totalOrders.toLocaleString()} orders</p>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#efe6db" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8a7666" }} interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8a7666" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  cursor={{ fill: "rgba(200,116,47,0.08)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e9ddcf", boxShadow: "0 8px 24px rgba(42,28,20,.12)", fontSize: 12 }}
                  formatter={(v) => [egp(Number(v)), "Revenue"]}
                />
                <Bar dataKey="revenue" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-bold">Top sellers</p>
          <p className="text-sm text-muted">Units sold · last {range} days</p>
          <ul className="mt-4 space-y-3.5">
            {top.map(({ item, qty }, i) => (
              <li key={item!.id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-bold text-muted">{i + 1}</span>
                <ItemImage src={item!.image} alt="" className="size-10 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="truncate font-semibold">{item!.name.en}</span>
                    <span className="font-bold tabular-nums">{qty}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-sand">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(qty / maxQty) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <p className="font-bold">Orders by hour</p>
          <p className="text-sm text-muted">Average across the selected period. Plan staffing around the 7–9 PM peak.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#efe6db" />
                <XAxis dataKey="h" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8a7666" }} tickFormatter={(h) => `${h}:00`} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#8a7666" }} />
                <Tooltip
                  cursor={{ fill: "rgba(42,28,20,0.05)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e9ddcf", fontSize: 12 }}
                  labelFormatter={(h) => `${h}:00 – ${h}:59`}
                  formatter={(v) => [v, "Orders"]}
                />
                <Bar dataKey="v" fill="#2a1c14" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-bold">Order channels</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-sand/60 p-4">
              <UtensilsCrossed className="size-5 text-brand-700" />
              <p className="mt-3 text-3xl font-extrabold">{dinePct}%</p>
              <p className="text-sm text-muted">Dine-in via QR</p>
            </div>
            <div className="rounded-2xl bg-sand/60 p-4">
              <Store className="size-5 text-brand-700" />
              <p className="mt-3 text-3xl font-extrabold">{100 - dinePct}%</p>
              <p className="text-sm text-muted">Takeaway</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["QR scans today", "312"],
              ["Scan → order conversion", "41%"],
              ["Link tree clicks (7d)", "3,175"],
              ["Waiter calls answered < 2 min", "94%"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line pb-2 last:border-0">
                <span className="text-muted">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <p className="font-bold">Latest orders</p>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand/50 text-start text-xs uppercase tracking-wider text-muted">
              <tr>
                {["Order", "Type", "Items", "Total", "Payment", "Status", "Time"].map((h) => <th key={h} className="px-5 py-2.5 text-start font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-sand/30">
                  <td className="px-5 py-3 font-bold">#{o.number}</td>
                  <td className="px-5 py-3">{o.type === "dine_in" ? `Table ${o.tableLabel}` : `Takeaway · ${o.customerName}`}</td>
                  <td className="max-w-56 truncate px-5 py-3 text-muted">{o.items.map((l) => `${l.quantity}× ${l.name.en}`).join(", ")}</td>
                  <td className="px-5 py-3 font-semibold">{egp(o.total)}</td>
                  <td className="px-5 py-3"><Badge tone={o.paymentStatus === "paid" ? "green" : "amber"}>{o.paymentStatus}</Badge></td>
                  <td className="px-5 py-3"><Badge tone={STATUS_TONE[o.status]}>{statusLabel[o.status].en}</Badge></td>
                  <td className="px-5 py-3 text-muted">{ago(o.createdAt, now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
