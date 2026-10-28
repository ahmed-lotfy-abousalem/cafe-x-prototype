"use client";

import { useShallow } from "zustand/react/shallow";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Delete, ShieldCheck } from "lucide-react";
import { useDevice, useVenue } from "@/lib/store";
import type { StaffUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, Logo } from "@/components/ui";
import { ROLE_LABEL } from "@/components/staff/StaffShell";

const HOME: Record<StaffUser["role"], string> = {
  owner: "/admin",
  manager: "/admin",
  cashier: "/staff",
  waiter: "/staff",
  kitchen: "/staff/kitchen",
};

export default function StaffLogin() {
  const router = useRouter();
  const staff = useVenue(useShallow((s) => s.staff.filter((u) => u.active)));
  const login = useDevice((s) => s.login);
  const [picked, setPicked] = useState<StaffUser | null>(null);
  const [pin, setPin] = useState("");
  
  const finish = () =>
    setTimeout(() => {
      // Demo: any 4-digit PIN signs in.
      if (!picked) return;
      login(picked.id);
      const nextUrl = new URLSearchParams(window.location.search).get("next");
      router.push(nextUrl && nextUrl !== "/staff/login" ? nextUrl : HOME[picked.role]);
    }, 250);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) finish();
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink p-12 text-cream lg:flex lg:flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=1400&q=70&auto=format&fit=crop" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="relative flex items-center gap-3">
          <Logo size={44} light />
          <span className="font-display text-2xl font-semibold">Café X</span>
        </div>
        <div className="relative mt-auto max-w-md">
          <p className="font-display text-4xl leading-tight font-semibold">Every order, on one screen. In real time.</p>
          <p className="mt-4 text-cream/70">Front-of-house, kitchen and management in one place: no lost tickets, no shouting across the bar.</p>
        </div>
      </div>

      {/* Sign-in */}
      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={40} />
            <span className="font-display text-2xl font-semibold">Café X</span>
          </div>

          {!picked ? (
            <div className="animate-fade">
              <h1 className="text-2xl font-bold">Staff sign-in</h1>
              <p className="mt-1 text-muted">Who&apos;s on shift?</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {staff.map((u) => (
                  <button key={u.id} onClick={() => setPicked(u)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-start shadow-card transition hover:border-brand hover:shadow-md">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full font-bold text-white" style={{ background: u.color }}>
                      {u.name.split(" ").map((p) => p[0]).join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{u.name.split(" ")[0]}</span>
                      <span className="block text-xs text-muted">{ROLE_LABEL[u.role]}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-line bg-white p-4">
                <p className="text-sm font-semibold">Or sign in with email</p>
                <div className="mt-3 flex gap-2">
                  <input className="flex-1 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-brand" placeholder="you@cafex.com" />
                  <Button variant="dark" onClick={() => setPicked(staff[1] ?? staff[0])}>
                    Continue <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="size-4" /> Role-based access · sessions expire after 12 h · demo: any PIN works
              </p>
            </div>
          ) : (
            <div className="animate-fade text-center">
              <span className="mx-auto grid size-20 place-items-center rounded-full text-2xl font-bold text-white" style={{ background: picked.color }}>
                {picked.name.split(" ").map((p) => p[0]).join("")}
              </span>
              <h1 className="mt-4 text-2xl font-bold">Hi {picked.name.split(" ")[0]} 👋</h1>
              <p className="text-muted">Enter your 4-digit PIN</p>
              <div className={"mt-6 flex justify-center gap-3"}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn("size-4 rounded-full transition", i < pin.length ? "scale-110 bg-brand" : "bg-line")} />
                ))}
              </div>
              <div className="mx-auto mt-8 grid max-w-xs grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button key={d} onClick={() => press(d)} className="h-16 rounded-2xl bg-white text-2xl font-semibold shadow-card active:scale-95 active:bg-sand">{d}</button>
                ))}
                <button onClick={() => { setPicked(null); setPin(""); }} className="h-16 rounded-2xl text-sm font-semibold text-muted">Back</button>
                <button onClick={() => press("0")} className="h-16 rounded-2xl bg-white text-2xl font-semibold shadow-card active:scale-95">0</button>
                <button onClick={() => setPin((p) => p.slice(0, -1))} className="grid h-16 place-items-center rounded-2xl text-muted" aria-label="Delete">
                  <Delete className="size-6" />
                </button>
              </div>
              <button onClick={() => { setPin("1234"); finish(); }} className="mt-6 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
                Demo: fill PIN automatically
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
