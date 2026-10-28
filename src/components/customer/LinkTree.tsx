"use client";

import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTable, useVenue } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LangToggle, LinkGlyph, Logo } from "@/components/ui";
import { openState } from "./shared";

export default function LinkTree({ preview = false }: { preview?: boolean }) {
  const { t, L, lang } = useT();
  const settings = useVenue((s) => s.settings);
  const links = useVenue(useShallow((s) => s.links.filter((l) => l.active)));
  const clickLink = useVenue((s) => s.clickLink);
  const table = useTable();
  const { open, close } = openState(settings);
  const brand = settings.brandColor;
  const menuHref = `/m/cafe-x${table ? `?t=${table.token}` : ""}`;

  return (
    <div className={cn("relative flex flex-col overflow-hidden bg-ink text-white", preview ? "min-h-full" : "min-h-dvh")}>
      {/* Cover */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={settings.coverImage} alt="" className="h-full w-full scale-105 object-cover opacity-55 blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/70 to-ink" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-5 pb-8">
        <div className="flex justify-end">{!preview && <LangToggle dark />}</div>

        <div className="mt-6 flex flex-col items-center text-center animate-fade">
          <Logo size={88} light className="shadow-float ring-4 ring-white/10" />
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">{settings.venueName}</h1>
          <p className="mt-1.5 text-white/75">{L(settings.tagline)}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur", open ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70")}>
              <span className={cn("size-1.5 rounded-full", open ? "bg-emerald-300 animate-pulse" : "bg-white/50")} />
              {open ? `${t("openNow")} · ${t("closesAt")} ${close}` : lang === "ar" ? "مغلق الآن" : "Closed now"}
            </span>
            {table && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <UtensilsCrossed className="size-3.5" />
                {t("table")} {table.label} · {table.zone}
              </span>
            )}
          </div>
        </div>

        {/* Order now */}
        <Link
          href={preview ? "#" : menuHref}
          className="group mt-8 flex items-center gap-4 rounded-3xl p-2 pe-5 shadow-float transition active:scale-[0.98]"
          style={{ background: brand }}
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-white/20 text-2xl">🍽️</span>
          <span className="flex-1 text-start">
            <span className="block text-lg font-bold">{t("orderNow")}</span>
            <span className="block text-sm text-white/85">{t("orderNowSub")}</span>
          </span>
          <ArrowRight className="size-6 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </Link>

        {/* Links */}
        <div className="mt-4 space-y-2.5">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={preview ? undefined : l.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => !preview && clickLink(l.id)}
              className="flex animate-fade items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 font-semibold backdrop-blur-md transition hover:bg-white/20"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                <LinkGlyph icon={l.icon} />
              </span>
              <span className="flex-1">{L(l.label)}</span>
              <ArrowRight className="size-4 opacity-50 rtl:rotate-180" />
            </a>
          ))}
        </div>

        <div className="mt-auto pt-10 text-center text-xs text-white/55">
          <p className="flex items-center justify-center gap-1.5">
            <MapPin className="size-3.5" /> {L(settings.address)}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <Clock className="size-3.5" /> {t("hours")}: {settings.hours[0].open} – {settings.hours[0].close}
          </p>
          <p className="mt-5 tracking-wide">
            {t("poweredBy")} <span className="font-bold text-white/80">Ordera</span>
          </p>
        </div>
      </div>
    </div>
  );
}
