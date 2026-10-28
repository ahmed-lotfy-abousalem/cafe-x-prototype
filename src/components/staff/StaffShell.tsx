"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LayoutGrid, LogOut, MonitorPlay, Volume2, VolumeX, Zap } from "lucide-react";
import { useDevice, useVenue } from "@/lib/store";
import type { Role, StaffUser } from "@/lib/types";
import { chime, clock, cn, useNow } from "@/lib/utils";
import { Logo } from "@/components/ui";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  waiter: "Waiter",
  kitchen: "Kitchen / Barista",
};

export function useStaffUser(): StaffUser | undefined {
  const id = useDevice((s) => s.staffUserId);
  return useVenue((s) => s.staff.find((u) => u.id === id));
}

/** Redirects to the staff login when nobody is signed in on this device. */
export function useRequireStaff(roles?: Role[]) {
  const user = useStaffUser();
  const router = useRouter();
  const ok = !!user && (!roles || roles.includes(user.role));
  useEffect(() => {
    if (!ok) router.replace(`/staff/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [ok, router]);
  return ok ? user : undefined;
}

/** Plays a chime + flashes the tab title when an order arrives from another tab. */
export function useNewOrderAlert() {
  const orders = useVenue((s) => s.orders);
  const soundOn = useDevice((s) => s.soundOn);
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);

  useEffect(() => {
    const ids = orders.filter((o) => o.status === "received").map((o) => `${o.id}:${o.addedRounds ?? 0}`);
    if (seen.current === null) {
      seen.current = new Set(ids);
      return;
    }
    const incoming = ids.filter((id) => !seen.current!.has(id));
    ids.forEach((id) => seen.current!.add(id));
    if (incoming.length) {
      if (soundOn) chime();
      const added = incoming.map((x) => x.split(":")[0]);
      setFresh((f) => [...f, ...added]);
      const t0 = document.title;
      let i = 0;
      const id = setInterval(() => {
        document.title = i++ % 2 ? t0 : "🔔 New order!";
        if (i > 8) {
          clearInterval(id);
          document.title = t0;
        }
      }, 700);
      setTimeout(() => setFresh((f) => f.filter((x) => !added.includes(x))), 6000);
    }
  }, [orders, soundOn]);

  return fresh;
}

export function StaffHeader({ dark, user }: { dark?: boolean; user: StaffUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const now = useNow(10_000);
  const soundOn = useDevice((s) => s.soundOn);
  const setSound = useDevice((s) => s.setSound);
  const logout = useDevice((s) => s.logout);
  const simulate = useVenue((s) => s.simulateOrder);
  const venue = useVenue((s) => s.settings.venueName);

  const tabs = [
    { href: "/staff", label: "Orders board", icon: LayoutGrid, roles: ["owner", "manager", "cashier", "waiter", "kitchen"] },
    { href: "/staff/kitchen", label: "Kitchen display", icon: MonitorPlay, roles: ["owner", "manager", "kitchen", "cashier"] },
    { href: "/admin", label: "Admin", icon: LayoutDashboard, roles: ["owner", "manager"] },
  ].filter((t) => t.roles.includes(user.role));

  return (
    <header className={cn("sticky top-0 z-30 border-b backdrop-blur", dark ? "border-kds-line bg-kds/95 text-cream" : "border-line bg-white/95")}>
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <Logo size={36} light={dark} />
        <div className="hidden leading-tight sm:block">
          <p className="font-bold">{venue}</p>
          <p className={cn("text-xs", dark ? "text-cream/60" : "text-muted")}>Staff · {ROLE_LABEL[user.role]}</p>
        </div>
        <span className={cn("ms-2 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold md:inline-flex", dark ? "bg-emerald-500/15 text-emerald-300" : "bg-sage-50 text-sage")}>
          <span className="size-2 animate-pulse rounded-full bg-current" /> Live
        </span>

        <nav className={cn("mx-auto flex gap-1 rounded-xl p-1", dark ? "bg-white/5" : "bg-sand")}>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                pathname === t.href ? (dark ? "bg-white/15 text-white" : "bg-white text-ink shadow-sm") : dark ? "text-cream/60 hover:text-white" : "text-ink-soft hover:text-ink",
              )}
            >
              <t.icon className="size-4" />
              <span className="hidden lg:inline">{t.label}</span>
            </Link>
          ))}
        </nav>

        <span className={cn("hidden font-mono text-lg font-semibold tabular-nums md:block", dark ? "text-cream/80" : "text-ink-soft")}>{clock(now)}</span>
        <button
          onClick={() => simulate()}
          title="Simulate an incoming customer order (demo)"
          className={cn("flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold", dark ? "bg-brand text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}
        >
          <Zap className="size-4" /> <span className="hidden xl:inline">Simulate order</span>
        </button>
        <button
          onClick={() => {
            setSound(!soundOn);
            if (!soundOn) chime();
          }}
          className={cn("grid size-9 place-items-center rounded-lg", dark ? "hover:bg-white/10" : "hover:bg-sand")}
          title={soundOn ? "Mute alerts" : "Unmute alerts"}
        >
          {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5 text-red-500" />}
        </button>
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: user.color }}>
            {user.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <button
            onClick={() => {
              logout();
              router.push("/staff/login");
            }}
            className={cn("grid size-9 place-items-center rounded-lg", dark ? "hover:bg-white/10" : "hover:bg-sand")}
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
