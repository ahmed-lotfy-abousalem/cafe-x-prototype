"use client";

import { allergenLabel, tagLabel } from "@/lib/i18n";
import { useVenue } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { egp } from "@/lib/utils";
import * as act from "./actions";
import { type BotReply, findCategories, findItems, has, norm } from "./nlp";

/* Demo engine for the owner assistant (English, with a few Arabic keywords).
   Read-only answers come straight from data; anything that changes the menu
   returns a confirm card so nothing happens without the owner's tap. */

export const OWNER_CHIPS = [
  "How did we do today?",
  "Sales this week",
  "Top sellers",
  "When are we busiest?",
  "What's happening right now?",
  "Mark Tiramisu sold out",
  "Raise iced drinks by 10",
  "Write a description for the Matcha Latte",
];

export function ownerWelcome(name: string): BotReply {
  return {
    text: `Hi ${name} 👋 I'm your business assistant. Ask me about sales, best sellers and peak hours, or tell me to update the menu. I'll always ask before changing anything.`,
    chips: OWNER_CHIPS.slice(0, 6),
  };
}

const CAT_WORDS: Record<string, string[]> = {
  iced: ["iced", "cold drinks", "iced drinks", "cold"],
  hot: ["hot drinks", "hot coffee", "coffee", "coffees"],
  breakfast: ["breakfast"],
  bowls: ["salads", "salad", "bowls"],
  mains: ["burgers", "mains", "main"],
  pizza: ["pizza", "pasta", "pizzas"],
  desserts: ["desserts", "dessert", "sweets", "cakes"],
  fresh: ["juices", "juice", "smoothies"],
};

const pct = (a: number, b: number) => `${a >= b ? "▲" : "▼"} ${Math.abs(((a - b) / b) * 100).toFixed(1)}%`;

export function ownerReply(raw: string): BotReply {
  const t = norm(raw);
  const v = useVenue.getState();
  const found = findItems(raw, v.items);
  const mentioned = found.map((x) => x.item);
  const exact = found.filter((x) => x.exact).map((x) => x.item);

  if (has(t, "hi", "hello", "hey", "help", "what can you do", "اهلا", "مرحبا") && t.trim().split(" ").length <= 5)
    return ownerWelcome("there");

  /* ---- Changes (confirm first) ---- */
  const soldOut = has(t, "sold out", "86", "out of", "unavailable", "ran out", "run out", "turn off", "disable", "hide", "خلص", "مش متاح");
  const restock = has(t, "back in stock", "in stock", "restock", "available again", "turn on", "enable", "unhide", "رجع", "متاح");
  if ((soldOut || restock) && mentioned.length) {
    const on = restock && !soldOut;
    const list = mentioned.filter((i) => i.available !== on);
    if (!list.length) return { text: `${mentioned.map((i) => i.name.en).join(", ")} ${on ? "is already available" : "is already sold out"}.` };
    return {
      text: `Here's the change. Confirm and it updates every guest's menu instantly:`,
      cards: [{
        kind: "confirm",
        title: `${on ? "Make available" : "Mark sold out"}: ${list.map((i) => i.name.en).join(", ")}`,
        detail: on ? "Guests will be able to order it again." : "Guests will see it greyed out as “Sold out”.",
        confirmLabel: on ? "Make available" : "Mark sold out",
        run: () => {
          list.forEach((i) => act.setAvailability(i.id, on));
          return `Done ✅ ${list.map((i) => i.name.en).join(", ")} ${on ? "is back on the menu" : "is now sold out on all menus"}.`;
        },
      }],
    };
  }

  if (has(t, "price", "prices", "raise", "increase", "lower", "reduce", "discount", "cut", "سعر", "زود", "قلل")) {
    const num = t.match(/(\d+(?:\.\d+)?)\s*(%|percent)?/);
    const cats = findCategories(raw, v.categories, CAT_WORDS);
    const targets: MenuItem[] = exact.length ? exact : cats.length ? v.items.filter((i) => cats.some((c) => c.id === i.categoryId)) : mentioned;
    if (!num || !targets.length)
      return { text: "Tell me what to change and by how much, e.g. “Raise iced drinks by 10”, “Lower desserts by 5%”, or “Set Espresso price to 80”.", chips: ["Raise iced drinks by 10", "Lower desserts by 5%", "Set Espresso price to 80"] };
    const n = Number(num[1]);
    const down = has(t, "lower", "reduce", "discount", "cut", "قلل");
    const isSet = has(t, " to ") && !has(t, "by") && targets.length === 1;
    const delta = isSet ? { setTo: n } : num[2] ? { percent: down ? -n : n } : { amount: down ? -n : n };
    const preview = targets.slice(0, 6).map((i) => {
      const next = isSet ? n : Math.max(1, Math.round(delta.percent !== undefined ? i.price * (1 + delta.percent / 100) : i.price + (delta.amount ?? 0)));
      return [i.name.en, `${egp(i.price)} → ${egp(next)}`] as [string, string];
    });
    if (targets.length > 6) preview.push([`+${targets.length - 6} more items`, ""]);
    return {
      text: `This updates ${targets.length} item${targets.length > 1 ? "s" : ""}. Please confirm:`,
      cards: [
        { kind: "stats", title: "Price preview", rows: preview },
        {
          kind: "confirm",
          title: `Update ${targets.length} price${targets.length > 1 ? "s" : ""}`,
          detail: "New prices apply to new orders only. Past orders keep their price.",
          confirmLabel: "Apply prices",
          run: () => {
            act.adjustPrices(targets.map((i) => i.id), delta);
            return `Done ✅ Prices updated for ${targets.length} item${targets.length > 1 ? "s" : ""}. Guests see them now.`;
          },
        },
      ],
    };
  }

  /* ---- Content help ---- */
  if (has(t, "describe", "description", "write", "copy", "caption", "instagram", "post", "وصف", "اكتب") && mentioned.length) {
    const i = mentioned[0];
    const tags = i.tags.map((x) => tagLabel[x].en.toLowerCase());
    return {
      text:
        `Here's a draft for **${i.name.en}**:\n\n` +
        `English:
${i.description.en} ${tags.length ? `A ${tags.join(", ")} favourite.` : ""} Ready in about ${i.prepMinutes} minutes.\n\n` +
        `العربية:
${i.description.ar} يتحضر في حوالي ${i.prepMinutes} دقايق.\n\n` +
        `📸 Instagram: “${i.name.en} season is every season ✨ ${egp(i.price)} at Café X. Tag who you're bringing! #CafeX #Zamalek”` +
        (i.allergens.length ? `\n\n_Allergens to list: ${i.allergens.map((a) => allergenLabel[a].en).join(", ")}._` : ""),
      cards: [{ kind: "items", itemIds: [i.id] }],
    };
  }

  /* ---- Analytics ---- */
  if (has(t, "top", "best", "best seller", "best sellers", "selling", "popular", "most ordered", "الاكثر", "اكتر حاجه")) {
    const top = act.topSellers(5);
    return {
      text: `**${top[0].item.name.en}** is your #1 seller. Coffee drives ${Math.round((top.filter((x) => ["hot", "iced"].includes(x.item.categoryId)).length / top.length) * 100)}% of your top 5. Consider pairing it with a dessert offer.`,
      cards: [{ kind: "stats", title: "Top sellers · last 14 days", rows: top.map((x, i) => [`${i + 1}. ${x.item.name.en}`, `${x.qty} sold`]) }],
    };
  }

  if (has(t, "busy", "busiest", "peak", "rush", "staffing", "staff schedule", "quiet", "slow hours", "ذروه", "زحمه")) {
    const b = act.busiestHour();
    return {
      text: `Your peak is **${b.h}:00–${Number(b.h) + 1}:00** (~${b.v} orders/hour), with a second wave at 9–10 AM. Quietest is 4–5 PM. That's a good slot for a happy-hour offer. I'd schedule an extra barista from 7 PM.`,
      cards: [{ kind: "stats", title: "Orders per hour (avg)", rows: [["Morning peak", "10:00 · 31/h"], ["Lunch", "14:00 · 33/h"], ["Evening peak", `${b.h}:00 · ${b.v}/h`], ["Quietest", "16:00 · 17/h"]] }],
    };
  }

  if (has(t, "right now", "now", "live", "happening", "pending", "kitchen", "queue", "unpaid", "requests", "waiting", "دلوقتي")) {
    const o = act.liveOps();
    return {
      text: o.waiting ? `${o.waiting} new order${o.waiting > 1 ? "s are" : " is"} waiting to be accepted. Worth a nudge to the team.` : "The kitchen queue is under control 👌",
      cards: [{
        kind: "stats",
        title: "Live operations",
        rows: [
          ["Active orders", String(o.active)],
          ["Waiting to be accepted", String(o.waiting)],
          ["Unpaid balance", egp(o.unpaid)],
          ["Open table requests", o.requests.length ? o.requests.map((r) => `T${r.tableLabel} ${r.kind}`).join(", ") : "None"],
        ],
      }],
    };
  }

  if (has(t, "sales", "revenue", "sold", "made", "earn", "earned", "money", "how did we do", "how are we doing", "numbers", "report", "today", "yesterday", "week", "month", "مبيعات", "دخل", "النهارده", "امبارح")) {
    const today = act.salesToday();
    if (has(t, "week", "7 days", "اسبوع")) {
      const w = act.salesPeriod(7);
      return { text: `This week you've made **${egp(w.revenue)}** from ${w.orders.toLocaleString()} orders, an average ticket of ${egp(w.avgTicket)}.`, cards: [{ kind: "stats", title: "Last 7 days", rows: [["Revenue", egp(w.revenue)], ["Orders", w.orders.toLocaleString()], ["Avg. ticket", egp(w.avgTicket)], ["Best day", "Thursday"]] }] };
    }
    if (has(t, "month", "30 days", "شهر")) {
      const mo = act.salesPeriod(30);
      return { text: `Over the last 30 days: **${egp(mo.revenue)}** from ${mo.orders.toLocaleString()} orders.`, cards: [{ kind: "stats", title: "Last 30 days", rows: [["Revenue", egp(mo.revenue)], ["Orders", mo.orders.toLocaleString()], ["Avg. ticket", egp(mo.avgTicket)]] }] };
    }
    const y = act.salesPeriod(14).yesterday;
    if (has(t, "yesterday", "امبارح"))
      return { text: `Yesterday you made **${egp(y.revenue)}** from ${y.orders} orders.`, cards: [{ kind: "stats", title: "Yesterday", rows: [["Revenue", egp(y.revenue)], ["Orders", String(y.orders)], ["Avg. ticket", egp(y.revenue / y.orders)]] }] };
    return {
      text: `Today so far: **${egp(today.revenue)}** from ${today.orders} orders, ${pct(today.revenue, y.revenue)} vs yesterday. QR ordering is ~70% of dine-in orders.`,
      cards: [{ kind: "stats", title: "Today", rows: [["Revenue", `${egp(today.revenue)} (${pct(today.revenue, y.revenue)})`], ["Orders", `${today.orders} (${pct(today.orders, y.orders)})`], ["Avg. ticket", egp(today.revenue / today.orders)], ["Top item", act.topSellers(1)[0].item.name.en]] }],
    };
  }

  if (mentioned.length) {
    const i = mentioned[0];
    return { text: `**${i.name.en}** · ${egp(i.price)} · ${i.available ? "available" : "sold out"}. Want to change its price, mark it sold out, or write a description?`, chips: [`Mark ${i.name.en} sold out`, `Set ${i.name.en} price to ${i.price + 10}`, `Write a description for ${i.name.en}`] };
  }

  return {
    text: "I didn't catch that. In this demo I can answer about sales, top sellers, peak hours and live operations, or update menu availability and prices.",
    chips: OWNER_CHIPS.slice(0, 6),
  };
}
