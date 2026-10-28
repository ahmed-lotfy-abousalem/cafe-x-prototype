"use client";

import { ArrowDown, ArrowUp, Check, ExternalLink, MousePointerClick, Plus, Trash2 } from "lucide-react";
import { IMAGES } from "@/lib/seed";
import { useVenue } from "@/lib/store";
import type { LinkIcon } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, Card, Field, Input, LinkGlyph, Select, Toggle } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import LinkTree from "@/components/customer/LinkTree";

const ICONS: LinkIcon[] = ["instagram", "tiktok", "facebook", "whatsapp", "maps", "phone", "website", "delivery"];
const COLORS = ["#c8742f", "#2f6b4f", "#9b2c2c", "#1f4e79", "#6b3fa0", "#2a1c14", "#d4a017"];
const COVERS = [IMAGES.interior, IMAGES.interior2, IMAGES.terrace, IMAGES.spread];

export default function LinkTreeEditor() {
  const v = useVenue();
  const s = v.settings;
  const totalClicks = v.links.reduce((a, l) => a + l.clicks, 0);

  return (
    <>
      <PageHeader
        title="Link tree"
        sub="What guests see first after scanning. Changes go live instantly."
        actions={<Button variant="outline" onClick={() => window.open("/l/cafe-x", "_blank")}><ExternalLink className="size-4" /> Open live page</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card className="p-5">
            <p className="font-bold">Branding</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Venue name"><Input value={s.venueName} onChange={(e) => v.updateSettings({ venueName: e.target.value })} /></Field>
              <Field label="Tagline (English)"><Input value={s.tagline.en} onChange={(e) => v.updateSettings({ tagline: { ...s.tagline, en: e.target.value } })} /></Field>
              <Field label="الشعار (عربي)"><Input dir="rtl" value={s.tagline.ar} onChange={(e) => v.updateSettings({ tagline: { ...s.tagline, ar: e.target.value } })} /></Field>
              <Field label="Logo">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-ink font-display text-xl font-bold text-cream">X</span>
                  <Button variant="outline" size="sm">Upload logo</Button>
                </div>
              </Field>
            </div>
            <p className="mt-5 mb-2 text-sm font-semibold">Button colour</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => v.updateSettings({ brandColor: c })} className="grid size-9 place-items-center rounded-full ring-offset-2 transition hover:scale-110" style={{ background: c, boxShadow: s.brandColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined }} aria-label={c}>
                  {s.brandColor === c && <Check className="size-4 text-white" />}
                </button>
              ))}
              <label className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border border-line text-xs font-bold">
                +<input type="color" value={s.brandColor} onChange={(e) => v.updateSettings({ brandColor: e.target.value })} className="absolute inset-0 opacity-0" />
              </label>
            </div>
            <p className="mt-5 mb-2 text-sm font-semibold">Cover photo</p>
            <div className="grid grid-cols-4 gap-2">
              {COVERS.map((c) => (
                <button key={c} onClick={() => v.updateSettings({ coverImage: c })} className={cn("relative h-20 overflow-hidden rounded-xl ring-offset-2", s.coverImage === c && "ring-2 ring-brand")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.replace("w=1400", "w=300")} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Links</p>
                <p className="text-sm text-muted">{totalClicks.toLocaleString()} clicks in the last 30 days</p>
              </div>
              <Button size="sm" onClick={() => v.upsertLink({ id: `l_${Date.now()}`, icon: "website", label: { en: "New link", ar: "رابط جديد" }, url: "https://", active: true, clicks: 0 })}>
                <Plus className="size-4" /> Add link
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {v.links.map((l, i) => (
                <div key={l.id} className={cn("rounded-2xl border border-line p-3", !l.active && "bg-sand/40")}>
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-cream"><LinkGlyph icon={l.icon} /></span>
                    <Select value={l.icon} onChange={(e) => v.upsertLink({ ...l, icon: e.target.value as LinkIcon })} className="w-36 py-2">
                      {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </Select>
                    <Input value={l.label.en} onChange={(e) => v.upsertLink({ ...l, label: { ...l.label, en: e.target.value } })} className="py-2" />
                    <Input dir="rtl" value={l.label.ar} onChange={(e) => v.upsertLink({ ...l, label: { ...l.label, ar: e.target.value } })} className="hidden py-2 md:block" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input value={l.url} onChange={(e) => v.upsertLink({ ...l, url: e.target.value })} className="py-2 font-mono text-xs" />
                    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-sand px-2 py-1.5 text-xs font-bold tabular-nums" title="Clicks"><MousePointerClick className="size-3.5" />{l.clicks}</span>
                    <button disabled={i === 0} onClick={() => v.moveLink(l.id, -1)} className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-30"><ArrowUp className="size-4" /></button>
                    <button disabled={i === v.links.length - 1} onClick={() => v.moveLink(l.id, 1)} className="grid size-8 place-items-center rounded-lg hover:bg-sand disabled:opacity-30"><ArrowDown className="size-4" /></button>
                    <button onClick={() => v.deleteLink(l.id)} className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                    <Toggle size="sm" checked={l.active} onChange={(x) => v.upsertLink({ ...l, active: x })} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Live phone preview */}
        <div className="xl:sticky xl:top-8 xl:self-start">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-muted">Live preview</p>
          <div className="mx-auto w-[340px] rounded-[48px] border-[10px] border-ink bg-ink shadow-float">
            <div className="relative h-[680px] overflow-y-auto rounded-[38px] no-scrollbar">
              <div className="absolute top-2 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
              <LinkTree preview />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
