"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, ChevronDown, ExternalLink, LayoutGrid, Link2, LogOut, Menu as MenuIcon, QrCode,
  ReceiptText, Settings, UsersRound, UtensilsCrossed, X,
} from "lucide-react";
import { useDevice, useVenue } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui";
import { ROLE_LABEL, useRequireStaff } from "@/components/staff/StaffShell";
import { OwnerAssistant } from "@/components/chat/Assistants";

const NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/tables", label: "Tables & QR", icon: QrCode },
  { href: "/admin/linktree", label: "Link tree", icon: Link2 },
  { href: "/admin/staff", label: "Staff & roles", icon: UsersRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useRequireStaff(["owner", "manager"]);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useDevice((s) => s.logout);
  const venue = useVenue((s) => s.settings.venueName);
  const live = useVenue((s) => s.orders.filter((o) => ["received", "preparing", "ready"].includes(o.status)).length);
  const [mobileNav, setMobileNav] = useState(false);
  if (!user) return null;

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo size={38} light />
        <div className="leading-tight">
          <p className="font-bold text-cream">{venue}</p>
          <button className="flex items-center gap-1 text-xs text-cream/60">Zamalek branch <ChevronDown className="size-3" /></button>
        </div>
      </div>
      <div className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const on = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobileNav(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                on ? "bg-white/12 text-white" : "text-cream/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <n.icon className="size-[18px]" />
              {n.label}
              {n.href === "/admin/orders" && live > 0 && <span className="ms-auto rounded-full bg-brand px-2 text-xs font-bold text-white">{live}</span>}
            </Link>
          );
        })}
        <div className="my-4 border-t border-white/10" />
        <Link href="/staff" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/65 hover:bg-white/5 hover:text-white">
          <LayoutGrid className="size-[18px]" /> Live orders board
        </Link>
        <a href="/l/cafe-x" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/65 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-[18px]" /> Customer view
        </a>
      </div>
      <div className="m-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: user.color }}>
          {user.name.split(" ").map((p) => p[0]).join("")}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-cream">{user.name}</p>
          <p className="text-xs text-cream/50">{ROLE_LABEL[user.role]}</p>
        </div>
        <button onClick={() => { logout(); router.push("/staff/login"); }} className="grid size-8 place-items-center rounded-lg text-cream/60 hover:bg-white/10" title="Sign out">
          <LogOut className="size-4" />
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-[#f7f3ee] lg:ps-64">
      <aside className="fixed inset-y-0 start-0 hidden w-64 bg-ink lg:block">{nav}</aside>
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileNav(false)} />
          <aside className="relative h-full w-72 animate-fade bg-ink">
            <button onClick={() => setMobileNav(false)} className="absolute end-3 top-5 text-cream"><X /></button>
            {nav}
          </aside>
        </div>
      )}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setMobileNav(true)} aria-label="Open menu"><MenuIcon /></button>
        <Logo size={30} />
        <span className="font-bold">{venue} Admin</span>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      <OwnerAssistant />
    </div>
  );
}
