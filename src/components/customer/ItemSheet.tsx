"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Flame, Leaf, X } from "lucide-react";
import { allergenLabel, tagLabel, useT } from "@/lib/i18n";
import { priceLine } from "@/lib/seed";
import { useDevice } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, ItemImage, Sheet, Stepper, Textarea } from "@/components/ui";

export default function ItemSheet({ item, onClose, onAdded }: { item: MenuItem | null; onClose: () => void; onAdded: () => void }) {
  return (
    <Sheet open={!!item} onClose={onClose}>
      {item && <ItemBody key={item.id} item={item} onClose={onClose} onAdded={onAdded} />}
    </Sheet>
  );
}

function ItemBody({ item, onClose, onAdded }: { item: MenuItem; onClose: () => void; onAdded: () => void }) {
  const { t, L, m, n } = useT();
  const addToCart = useDevice((s) => s.addToCart);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [sel, setSel] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(item.modifierGroups.map((g) => [g.id, g.min === 1 && g.max === 1 ? [g.options[0].id] : []])),
  );

  const toggle = (gid: string, oid: string, max: number) =>
    setSel((s) => {
      const cur = s[gid] ?? [];
      if (max === 1) return { ...s, [gid]: [oid] };
      if (cur.includes(oid)) return { ...s, [gid]: cur.filter((x) => x !== oid) };
      if (cur.length >= max) return s;
      return { ...s, [gid]: [...cur, oid] };
    });

  const optionIds = Object.values(sel).flat();
  const unit = useMemo(
    () => item.price + item.modifierGroups.flatMap((g) => g.options).filter((o) => optionIds.includes(o.id)).reduce((a, o) => a + o.price, 0),
    [item, optionIds],
  );
  const valid = item.modifierGroups.every((g) => (sel[g.id]?.length ?? 0) >= g.min);

  const add = () => {
    addToCart(priceLine(item, qty, optionIds, notes.trim()));
    onAdded();
  };

  return (
    <div>
      <div className="relative">
        <ItemImage src={item.image} alt={L(item.name)} className="h-64 w-full sm:h-72" />
        <button onClick={onClose} className="absolute top-4 end-4 grid size-10 place-items-center rounded-full bg-white/90 shadow backdrop-blur" aria-label="Close">
          <X className="size-5" />
        </button>
        <div className="absolute start-4 bottom-4 flex gap-1.5">
          {item.tags.map((tg) => (
            <Badge key={tg} tone="dark" className="bg-ink/80 backdrop-blur">
              {tg === "spicy" && <Flame className="size-3" />}
              {(tg === "vegan" || tg === "vegetarian") && <Leaf className="size-3" />}
              {L(tagLabel[tg])}
            </Badge>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold leading-tight">{L(item.name)}</h2>
          <span className="shrink-0 pt-1 text-lg font-bold text-brand-700">{m(item.price)}</span>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{L(item.description)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted">
          <span>{n(item.calories)} {t("kcal")}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" /> ~{n(item.prepMinutes)} {t("min")}</span>
          {item.allergens.length > 0 && (
            <span>
              {t("allergens")}: {item.allergens.map((a) => L(allergenLabel[a])).join(" · ")}
            </span>
          )}
        </div>
      </div>

      {item.modifierGroups.map((g) => {
        const count = sel[g.id]?.length ?? 0;
        return (
          <div key={g.id} className="mt-6">
            <div className="flex items-center justify-between bg-sand/60 px-5 py-2.5">
              <div>
                <p className="font-bold">{L(g.name)}</p>
                <p className="text-xs text-muted">
                  {g.max === 1 ? t("chooseOne") : `${t("chooseUpTo")} ${n(g.max)}`}
                </p>
              </div>
              <Badge tone={g.min > 0 ? (count >= g.min ? "green" : "brand") : "neutral"}>
                {g.min > 0 && count >= g.min && <Check className="size-3" />}
                {g.min > 0 ? t("required") : t("optional")}
              </Badge>
            </div>
            <div className="divide-y divide-line/70 px-5">
              {g.options.map((o) => {
                const on = sel[g.id]?.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle(g.id, o.id, g.max)} className="flex w-full items-center gap-3 py-3.5 text-start">
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center border-2 transition",
                        g.max === 1 ? "rounded-full" : "rounded-md",
                        on ? "border-brand bg-brand text-white" : "border-line",
                      )}
                    >
                      {on && (g.max === 1 ? <span className="size-2 rounded-full bg-white" /> : <Check className="size-3.5" strokeWidth={3} />)}
                    </span>
                    <span className="flex-1 font-medium">{L(o.name)}</span>
                    {o.price > 0 && <span className="text-sm text-muted">+{m(o.price)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-6 px-5">
        <p className="mb-2 font-bold">{t("specialRequest")}</p>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("specialPlaceholder")} />
      </div>

      <div className="sticky bottom-0 z-10 mt-6 border-t border-line bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Stepper value={qty} onChange={setQty} min={1} />
          <Button size="lg" className="min-w-0 flex-1 justify-between whitespace-nowrap px-5" disabled={!valid} onClick={add}>
            <span>{t("addToOrder")}</span>
            <span>{m(unit * qty)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
