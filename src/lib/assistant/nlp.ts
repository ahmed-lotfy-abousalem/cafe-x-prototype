import type { Category, Lang, MenuItem } from "@/lib/types";

export type ChatCard =
  | { kind: "items"; itemIds: string[]; qty?: Record<string, number>; added?: boolean }
  | { kind: "order"; orderId: string }
  | { kind: "cart" }
  | { kind: "stats"; title?: string; rows: [string, string][] }
  | { kind: "confirm"; title: string; detail?: string; confirmLabel: string; cancelLabel?: string; run: () => string | BotReply };

export type BotReply = { text: string; cards?: ChatCard[]; chips?: string[]; lang?: Lang };

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Lowercase, Arabic letter folding, Arabic digits → Latin, punctuation → spaces. */
export function norm(s: string) {
  return ` ${s
    .toLowerCase()
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}%]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

export const isArabic = (s: string) => /[؀-ۿ]/.test(s);
export const replyLang = (raw: string, fallback: Lang): Lang => (isArabic(raw) ? "ar" : /[a-z]/i.test(raw) ? "en" : fallback);

/** True if the normalised text contains any of the phrases (whole-word for short Latin words). */
export function has(t: string, ...phrases: string[]) {
  return phrases.some((p) => {
    const n = norm(p).trim();
    if (!n) return false;
    return /^[a-z0-9 %]+$/.test(n) ? t.includes(` ${n} `) || t.includes(` ${n}s `) : t.includes(n);
  });
}

const STOP = new Set([
  "with", "and", "the", "cafe", "classic", "fresh", "house", "single", "glazed", "chunky", "juice",
  "مع", "كافيه", "اكس", "عصير", "المميز", "فريش",
]);

const stripAl = (w: string) => (w.length > 4 && w.startsWith("ال") ? w.slice(2) : w);
const words = (s: string) => norm(s).trim().split(" ").map(stripAl).filter((w) => (w.length >= 4 || /[؀-ۿ]{3,}/.test(w)) && !STOP.has(w));

const NUM_WORDS: Record<string, number> = {
  one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, couple: 2,
  واحد: 1, واحده: 1, اتنين: 2, اثنين: 2, تلاته: 3, ثلاثه: 3, اربعه: 4,
};

/**
 * Finds menu items mentioned in the text. Full-name matches win (longest first, then
 * removed so "iced spanish latte" doesn't also match "spanish latte"); otherwise the
 * best keyword matches, so "latte" returns every latte for the guest to pick from.
 */
export function findItems(raw: string, items: MenuItem[]) {
  let t = norm(raw);
  const found: { item: MenuItem; qty: number; exact: boolean }[] = [];
  const byLen = [...items].sort((a, b) => b.name.en.length - a.name.en.length);
  for (const it of byLen) {
    for (const name of [norm(it.name.en).trim(), norm(it.name.ar).trim()]) {
      const idx = t.indexOf(` ${name} `);
      if (idx >= 0) {
        found.push({ item: it, qty: qtyBefore(t.slice(Math.max(0, idx - 14), idx + 1), true), exact: true });
        t = t.slice(0, idx) + " · " + t.slice(idx + name.length + 1);
        break;
      }
    }
  }
  if (found.length) return found;

  const tokens = new Set(t.trim().split(" ").map(stripAl));
  const scored = items
    .map((it) => ({ it, score: [...new Set([...words(it.name.en), ...words(it.name.ar)])].filter((w) => tokens.has(w)).length }))
    .filter((x) => x.score > 0);
  const best = Math.max(0, ...scored.map((x) => x.score));
  const q = qtyBefore(t);
  return scored.filter((x) => x.score === best).slice(0, 4).map((x) => ({ item: x.it, qty: q, exact: false }));
}

/**
 * Quantity for one item. `scoped` = only the words right before this item's name, cut at
 * the previous item or "and", so "2 lattes and a tiramisu" gives the tiramisu 1, not 2.
 */
function qtyBefore(t: string, scoped = false) {
  const seg = scoped ? t.split(/·| and | plus | with | و |،|,/).pop()! : t;
  const d = seg.match(/(\d{1,2})\s*(x|×)?\s*$/) ?? (scoped ? null : seg.match(/(\d{1,2})/));
  if (d) return Math.min(20, Math.max(1, Number(d[1])));
  const ws = seg.trim().split(" ").reverse();
  for (const w of scoped ? ws.slice(0, 2) : ws) if (NUM_WORDS[w]) return NUM_WORDS[w];
  return 1;
}

export function findCategories(raw: string, categories: Category[], extra: Record<string, string[]> = {}) {
  const t = norm(raw);
  return categories.filter(
    (c) => t.includes(` ${norm(c.name.en).trim()} `) || t.includes(norm(c.name.ar).trim()) || (extra[c.id] ?? []).some((w) => has(t, w)),
  );
}

export function priceLimit(raw: string) {
  const t = norm(raw);
  const m = t.match(/(under|below|less than|max|cheaper than|budget|اقل من|تحت|في حدود|بحد اقصي)\s*(egp\s*)?(\d{2,4})/);
  return m ? Number(m[3]) : undefined;
}

export const say = (lang: Lang, en: string, ar: string) => (lang === "ar" ? ar : en);
