"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDevice, useVenue } from "@/lib/store";

const CUSTOMER_ROUTES = ["/l", "/m", "/track"];
const DEMO_TTL = 12 * 60 * 60 * 1000;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const lang = useDevice((s) => s.lang);

  useEffect(() => {
    Promise.all([useVenue.persist.rehydrate(), useDevice.persist.rehydrate()]).then(() => {
      // Keep demo orders fresh: re-seed if the stored data is from a previous day.
      if (Date.now() - useVenue.getState().seededAt > DEMO_TTL) useVenue.getState().resetDemo();
      // First visit: write the seed now so every tab shares the same dataset.
      else if (!localStorage.getItem("cafex-venue")) useVenue.setState({ seededAt: useVenue.getState().seededAt });
      setReady(true);
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cafex-venue") useVenue.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const customer = CUSTOMER_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
    const l = customer ? lang : "en";
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, [lang, pathname]);

  if (!ready) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-cream">
        <div className="flex flex-col items-center gap-3 animate-fade">
          <div className="grid size-14 place-items-center rounded-2xl bg-ink font-display text-2xl font-bold text-cream">X</div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-sand">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
