"use client";

import { allergenLabel, money, statusLabel } from "@/lib/i18n";
import { totals } from "@/lib/seed";
import { useDevice, useVenue } from "@/lib/store";
import type { Allergen, Lang, MenuItem, Tag } from "@/lib/types";
import * as act from "./actions";
import { type BotReply, findCategories, findItems, has, norm, priceLimit, replyLang, say } from "./nlp";

/* Demo engine for the guest assistant: keyword intents in English + Egyptian Arabic,
   answered from live app data. Production swaps this for Claude Haiku 5.5 with the
   same functions in ./actions exposed as tools. */

export const GUEST_CHIPS: Record<Lang, string[]> = {
  en: ["Recommend something", "Vegan options", "Something sweet under 150", "Where's my order?", "Call the waiter"],
  ar: ["رشحلي حاجة", "أكل نباتي", "حاجة حلوة أقل من ١٥٠", "طلبي فين؟", "نادي الويتر"],
};

export function guestWelcome(lang: Lang): BotReply {
  const name = useVenue.getState().settings.venueName;
  return {
    text: say(
      lang,
      `Hi! I'm the ${name} assistant 👋 Ask me about the menu, allergens, recommendations, or your order. I can also call the waiter for you.`,
      `أهلاً! أنا مساعد ${name} 👋 اسألني عن المنيو، مسببات الحساسية، الترشيحات، أو طلبك. وكمان أقدر أنادي الويتر.`,
    ),
    chips: GUEST_CHIPS[lang],
    lang,
  };
}

const ALLERGEN_WORDS: Record<Allergen, string[]> = {
  nuts: ["nut", "nuts", "peanut", "almond", "hazelnut", "cashew", "مكسرات", "سوداني", "لوز", "بندق", "كاجو"],
  gluten: ["gluten", "wheat", "celiac", "coeliac", "جلوتين", "جلوتين", "قمح"],
  dairy: ["dairy", "milk", "lactose", "cheese", "cream", "البان", "لبن", "حليب", "لاكتوز", "جبنه"],
  eggs: ["egg", "eggs", "بيض"],
  soy: ["soy", "soya", "صويا"],
  fish: ["fish", "seafood", "سمك"],
};

const CATEGORY_WORDS: Record<string, string[]> = {
  desserts: ["sweet", "dessert", "cake", "حلو", "حلويات", "حلوه", "تحليه", "كيك"],
  iced: ["cold", "iced", "refreshing", "chilled", "ساقع", "مثلج", "منعش", "ايس"],
  fresh: ["juice", "smoothie", "fresh", "عصير", "سموذي", "فريش"],
  hot: ["hot", "warm", "coffee", "espresso", "قهوه", "سخن", "ساخن"],
  breakfast: ["breakfast", "morning", "فطار", "فطور", "الصبح"],
  bowls: ["healthy", "light", "diet", "salad", "bowl", "صحي", "دايت", "خفيف", "سلطه"],
  mains: ["hungry", "meal", "lunch", "dinner", "burger", "main", "جعان", "غدا", "عشا", "برجر", "وجبه"],
  pizza: ["pizza", "pasta", "بيتزا", "باستا", "مكرونه"],
};

const ORDER_VERBS = ["want", "would like", "id like", "i ll have", "ill have", "get me", "order", "add", "give me", "can i get", "can i have", "take", "please", "عايز", "عاوز", "عايزه", "عاوزه", "هات", "اطلب", "ضيف", "ممكن", "اديني", "هاخد"];

export function guestReply(raw: string, fallbackLang: Lang): BotReply {
  const lang = replyLang(raw, fallbackLang);
  return { ...answer(raw, lang), lang };
}

function answer(raw: string, lang: Lang): BotReply {
  const t = norm(raw);
  const v = useVenue.getState();
  const L = (x: { en: string; ar: string }) => x[lang] || x.en;
  const m = (n: number) => money(n, lang, v.settings.currency);
  const items = v.items;
  const mentioned = findItems(raw, items);

  /* Greetings & thanks */
  if (has(t, "hi", "hello", "hey", "salam", "السلام", "اهلا", "مرحبا", "هاي", "ازيك") && t.trim().split(" ").length <= 4)
    return guestWelcome(lang);
  if (has(t, "thanks", "thank you", "thx", "شكرا", "تسلم", "متشكر", "ميرسي"))
    return { text: say(lang, "Anytime! Enjoy your visit ☕", "العفو! نورتنا ☕"), chips: GUEST_CHIPS[lang].slice(0, 3) };

  /* Complaint → apologise + alert staff */
  const complaint =
    has(t, "bad", "terrible", "awful", "wrong", "dirty", "rude", "disgusting", "complain", "complaint", "not good", "too salty", "taking forever", "وحش", "سيء", "غلط", "مقرف", "شكوي", "مش حلو", "مش كويس", "وسخ") ||
    /\b(is|was|too|so|got|came)\s+(cold|late|slow)\b/.test(t) ||
    has(t, "برد", "بارده", "اتاخر", "متاخر", "بطيء");
  if (complaint) {
    const table = act.requestService("waiter");
    return {
      text: say(
        lang,
        `I'm really sorry about that 🙏 I've alerted our team${table !== "?" ? ` at table ${table}` : ""} and a manager is coming over to make it right.`,
        `بنعتذر جدًا 🙏 بلّغت الفريق${table !== "?" ? ` على طاولة ${table}` : ""} وحد من الإدارة جاي حالًا يحل المشكلة.`,
      ),
    };
  }

  /* Service requests */
  if (has(t, "bill", "check please", "the check", "pay", "payment", "receipt", "الحساب", "الفاتوره", "ادفع", "الشيك")) {
    const table = act.requestService("bill");
    const at = table !== "?";
    return { text: say(lang, `Done ✅ Your bill is on its way${at ? ` to table ${table}` : ""}. You can pay by cash or card.`, `تمام ✅ الحساب في الطريق${at ? ` لطاولة ${table}` : " ليك"}. تقدر تدفع كاش أو فيزا.`) };
  }
  if (has(t, "waiter", "server", "staff", "someone", "call", "ويتر", "جرسون", "حد ييجي", "محتاج حد", "نادي")) {
    const table = act.requestService("waiter");
    const at = table !== "?";
    return { text: say(lang, `On it 🔔 A team member is heading${at ? ` to table ${table}` : " your way"}.`, `حاضر 🔔 حد من الفريق جاي${at ? ` لطاولة ${table}` : "لك"} دلوقتي.`) };
  }

  /* Venue info */
  if (has(t, "wifi", "wi fi", "internet", "password", "واي فاي", "الواي فاي", "النت", "باسورد"))
    return { text: say(lang, "Wi-Fi: **CafeX-Guest** · Password: **coffee2026** 📶", "الواي فاي: **CafeX-Guest** · الباسورد: **coffee2026** 📶") };
  if (has(t, "address", "location", "located", "map", "parking", "where are you", "العنوان", "مكانكم", "فين المكان", "ركن"))
    return { text: say(lang, `📍 ${L(v.settings.address)}. Street parking is available nearby.`, `📍 ${L(v.settings.address)}. فيه ركن في الشارع جنبنا.`) };
  if (has(t, "hours", "open", "close", "closing", "opening", "what time", "مواعيد", "بتفتحوا", "بتقفلوا", "امتي تفتح", "امتي تقفل")) {
    const h = v.settings.hours[0];
    return { text: say(lang, `We're open daily ${h.open} – ${h.close} (until 02:00 Thu & Fri) 🕗`, `مفتوحين يوميًا من ${h.open} لحد ${h.close} (ولحد ٢ بالليل الخميس والجمعة) 🕗`) };
  }
  if (has(t, "reserve", "reservation", "booking", "book a table", "phone number", "حجز", "احجز", "رقم التليفون"))
    return { text: say(lang, `You can reserve on ${v.settings.phone} or WhatsApp the same number 📞`, `للحجز كلمنا على ${v.settings.phone} أو واتساب على نفس الرقم 📞`) };

  /* Table number ("table 5", "طاولة ٥") */
  const tableMatch = t.match(/(?:table|طاوله|ترابيزه|تربيزه)\s*(t\s?\d+|\d+|bar)\b/);
  if (tableMatch && !mentioned.some((x) => x.exact)) {
    const label = tableMatch[1].replace(/\s/g, "");
    const tb = act.setTableByLabel(label);
    if (!tb) return { text: say(lang, `I couldn't find table ${label}. Please check the number on your table card.`, `مش لاقي طاولة ${label}. اتأكد من الرقم اللي على الطاولة.`), chips: tableChips(lang) };
    if (act.cartSummary().count) return orderConfirm(lang);
    return { text: say(lang, `Got it, table ${tb.label} ✅ What would you like?`, `تمام، طاولة ${tb.label} ✅ تحب تطلب إيه؟`), chips: GUEST_CHIPS[lang].slice(0, 3) };
  }

  /* Place the order: always ends in a confirm card the guest taps */
  const placeIntent = has(t, "place order", "place my order", "place the order", "order now", "send my order", "send it", "send to kitchen", "confirm", "checkout", "check out", "that s all", "thats all", "that s it", "thats it", "go ahead", "finish", "done", "خلاص", "كده تمام", "تمام كده", "اكد", "ابعت الطلب", "ابعته", "اطلب دلوقتي", "اطلب الطلب", "اكمل الطلب");
  if (placeIntent && !mentioned.length) return orderConfirm(lang);

  /* Order status */
  if (has(t, "my order", "status", "how long", "ready", "eta", "where is", "wheres", "طلبي", "الطلب فين", "جاهز", "هيجي امتي", "لسه")) {
    const o = act.myActiveOrder();
    if (!o) return { text: say(lang, "I can't see an order from this phone yet. Want some recommendations to get started?", "مش لاقي طلب من الموبايل ده لسه. تحب أرشحلك حاجة؟"), chips: GUEST_CHIPS[lang].slice(0, 3) };
    const s = L(statusLabel[o.status]);
    const eta = ["received", "preparing"].includes(o.status) ? say(lang, ` · about ${act.orderEta(o)} min`, ` · حوالي ${act.orderEta(o)} دقيقة`) : "";
    return { text: say(lang, `Order #${o.number} is **${s}**${eta}.`, `طلب رقم #${o.number} حالته **${s}**${eta}.`), cards: [{ kind: "order", orderId: o.id }] };
  }

  /* Cart */
  if (has(t, "cart", "basket", "checkout", "my items", "view order", "السله", "الكارت", "اكمل الطلب")) {
    const c = act.cartSummary();
    return c.count
      ? { text: say(lang, `You have ${c.count} item(s) · ${m(c.total)}.`, `عندك ${c.count} صنف · ${m(c.total)}.`), cards: [{ kind: "cart" }] }
      : { text: say(lang, "Your order is empty for now. Want a suggestion?", "طلبك فاضي لسه. تحب ترشيح؟"), chips: GUEST_CHIPS[lang].slice(0, 3) };
  }

  /* Allergens */
  const allergens = (Object.keys(ALLERGEN_WORDS) as Allergen[]).filter((a) => has(t, ...ALLERGEN_WORDS[a]));
  if (allergens.length) {
    const aNames = allergens.map((a) => L(allergenLabel[a])).join(", ");
    const disclaimer = say(lang, "\n\n_Please confirm with our staff if you have a severe allergy._", "\n\n_لو عندك حساسية شديدة، أكد مع الفريق من فضلك._");
    if (mentioned.length) {
      const lines = mentioned.map(({ item }) => {
        const hit = allergens.filter((a) => item.allergens.includes(a));
        return hit.length
          ? say(lang, `⚠️ **${L(item.name)}** contains ${hit.map((a) => L(allergenLabel[a])).join(", ")}.`, `⚠️ **${L(item.name)}** فيه ${hit.map((a) => L(allergenLabel[a])).join("، ")}.`)
          : say(lang, `✅ **${L(item.name)}** has no ${aNames} listed.`, `✅ **${L(item.name)}** مفيهوش ${aNames}.`);
      });
      return { text: lines.join("\n") + disclaimer, cards: [{ kind: "items", itemIds: mentioned.map((x) => x.item.id) }] };
    }
    const safe = act.searchMenu({ withoutAllergens: allergens, categoryIds: findCategories(raw, v.categories, CATEGORY_WORDS).map((c) => c.id), limit: 6 });
    return {
      text: say(lang, `Here are popular picks with no ${aNames}:`, `دي اختيارات من غير ${aNames}:`) + disclaimer,
      cards: [{ kind: "items", itemIds: safe.map((i) => i.id) }],
    };
  }

  /* Dietary */
  const dietTags: Tag[] = has(t, "vegan", "plant based", "نباتي صرف", "فيجان") ? ["vegan"] : has(t, "vegetarian", "veggie", "no meat", "نباتي", "من غير لحمه") ? ["vegetarian", "vegan"] : [];
  if (dietTags.length) {
    const list = act.searchMenu({ tags: dietTags, categoryIds: findCategories(raw, v.categories, CATEGORY_WORDS).map((c) => c.id), maxPrice: priceLimit(raw), limit: 6 });
    return {
      text: say(lang, dietTags[0] === "vegan" ? "Our vegan options 🌱" : "Vegetarian-friendly picks 🌿", dietTags[0] === "vegan" ? "الأصناف النباتية الصرف 🌱" : "أصناف نباتية 🌿"),
      cards: [{ kind: "items", itemIds: list.map((i) => i.id) }],
    };
  }

  /* Pairing / upsell */
  if (mentioned.length && has(t, "goes with", "go with", "pair", "with my", "side", "يمشي مع", "يليق مع", "اخد معاه", "مع ال")) {
    const base = mentioned[0].item;
    const drink = ["hot", "iced", "fresh"].includes(base.categoryId);
    const picks = drink
      ? act.searchMenu({ categoryIds: ["desserts", "breakfast"], limit: 3 })
      : act.searchMenu({ categoryIds: ["iced", "fresh", "hot"], tags: ["popular", "vegan"], limit: 3 });
    return {
      text: say(lang, `Great choice! With **${L(base.name)}** guests love:`, `اختيار حلو! مع **${L(base.name)}** الناس بتحب:`),
      cards: [{ kind: "items", itemIds: picks.map((i) => i.id) }],
    };
  }

  /* Ordering by chat / item info (a category word beats a partial name hit, e.g. "pizza") */
  const catHit = findCategories(raw, v.categories, CATEGORY_WORDS).length > 0;
  if (mentioned.length && (mentioned.some((x) => x.exact) || !catHit)) {
    const ordering = has(t, ...ORDER_VERBS) || /\d/.test(t);
    const ids = mentioned.map((x) => x.item.id);
    const qty = Object.fromEntries(mentioned.map((x) => [x.item.id, x.qty]));
    const soldOut = mentioned.filter((x) => !x.item.available);
    const note = soldOut.length ? say(lang, `\n\n😕 ${soldOut.map((x) => L(x.item.name)).join(", ")} is sold out right now.`, `\n\n😕 ${soldOut.map((x) => L(x.item.name)).join("، ")} خلص حاليًا.`) : "";
    // Only auto-add when we know exactly which items: "a latte" could be four drinks.
    const unambiguous = mentioned.every((x) => x.exact) || mentioned.length === 1;
    if (!unambiguous || (mentioned.length > 1 && !ordering))
      return { text: say(lang, "Which one did you mean?", "تقصد أنهي واحد؟") + note, cards: [{ kind: "items", itemIds: ids, qty }] };
    if (ordering) {
      const added = mentioned.filter((x) => x.item.available && act.addToCart(x.item.id, x.qty));
      if (!added.length) return { text: note.trim() || say(lang, "Sorry, that's not available right now.", "معلش، ده مش متاح حاليًا."), chips: GUEST_CHIPS[lang].slice(0, 2) };
      const c = act.cartSummary();
      const next = orderConfirm(lang);
      return {
        text:
          say(
            lang,
            `Added ${added.map((x) => `${x.qty}× ${L(x.item.name)}`).join(", ")} ✅ with the standard options (tap Customise to change). Your order: ${c.count} item${c.count > 1 ? "s" : ""} · ${m(c.total)}.`,
            `ضفت ${added.map((x) => `${x.qty}× ${L(x.item.name)}`).join("، ")} ✅ بالإضافات العادية (دوس تخصيص لو عايز تغيّر). طلبك: ${c.count} صنف · ${m(c.total)}.`,
          ) +
          note +
          "\n\n" +
          (next.cards ? say(lang, "Anything else? Or tap **Place order** and I'll send it to the kitchen.", "تحب تضيف حاجة تانية؟ أو دوس **اطلب الآن** وهبعته للمطبخ.") : next.text),
        cards: [{ kind: "items", itemIds: added.map((x) => x.item.id), qty: Object.fromEntries(added.map((x) => [x.item.id, x.qty])), added: true }, ...(next.cards ?? [])],
        chips: next.chips ?? [say(lang, "Add a dessert", "ضيف حلو"), say(lang, "Recommend a drink", "رشحلي مشروب")],
      };
    }
    const it = mentioned[0].item;
    return {
      text: `**${L(it.name)}** · ${m(it.price)}\n${L(it.description)}\n${it.calories} ${say(lang, "kcal", "سعرة")} · ~${it.prepMinutes} ${say(lang, "min", "دقيقة")}${it.allergens.length ? ` · ${say(lang, "Contains", "يحتوي على")}: ${it.allergens.map((a) => L(allergenLabel[a])).join(", ")}` : ""}` + note,
      cards: [{ kind: "items", itemIds: [it.id] }],
    };
  }

  /* Recommendations */
  const cats = findCategories(raw, v.categories, CATEGORY_WORDS).map((c) => c.id);
  const spicy = has(t, "spicy", "hot sauce", "حار", "سبايسي");
  const max = priceLimit(raw);
  const wantsRec = has(t, "recommend", "suggest", "best", "popular", "favorite", "favourite", "what should", "something", "anything", "ترشح", "رشحلي", "احسن", "اشهر", "ايه الحلو", "حاجه", "اقترح") || cats.length || spicy || max !== undefined;
  if (wantsRec) {
    let list: MenuItem[] = act.searchMenu({ categoryIds: cats, tags: spicy ? ["spicy"] : undefined, maxPrice: max, limit: 6 });
    if (!list.length) list = act.searchMenu({ categoryIds: cats, limit: 4 });
    const what = cats.length ? cats.map((c) => L(v.categories.find((x) => x.id === c)!.name)).join(" & ") : "";
    return {
      text: max !== undefined
        ? say(lang, `Top picks${what ? ` in ${what}` : ""} under ${m(max)}:`, `أحسن اختيارات${what ? ` في ${what}` : ""} أقل من ${m(max)}:`)
        : say(lang, what ? `Our favourites in ${what} ✨` : "Our guests' favourites right now ✨", what ? `المفضّل عندنا في ${what} ✨` : "الأكثر طلبًا عندنا دلوقتي ✨"),
      cards: [{ kind: "items", itemIds: list.map((i) => i.id) }],
    };
  }

  /* Menu overview */
  if (has(t, "menu", "categories", "what do you have", "what do you serve", "options", "المنيو", "عندكم ايه", "فيه ايه"))
    return { text: say(lang, "Here's what we serve. Pick a section:", "ده اللي بنقدمه، اختار قسم:"), chips: v.categories.filter((c) => c.active).map((c) => `${c.icon} ${L(c.name)}`) };

  /* Fallback: never guess */
  return {
    text: say(
      lang,
      "Sorry, I didn't catch that. I can help with the menu, allergens, recommendations, your order status, or calling the waiter.",
      "معلش، مفهمتش قصدك. أقدر أساعدك في المنيو، مسببات الحساسية، الترشيحات، حالة طلبك، أو أنادي الويتر.",
    ),
    chips: GUEST_CHIPS[lang],
  };
}

function tableChips(lang: Lang) {
  return useVenue
    .getState()
    .tables.filter((x) => x.active)
    .slice(0, 8)
    .map((x) => `${say(lang, "Table", "طاولة")} ${x.label}`);
}

/** Builds the "send it to the kitchen?" step: asks for the table first if we don't know it. */
function orderConfirm(lang: Lang): BotReply {
  const v = useVenue.getState();
  const L = (x: { en: string; ar: string }) => x[lang] || x.en;
  const m = (n: number) => money(n, lang, v.settings.currency);
  const cart = useDevice.getState().cart;
  if (!cart.length)
    return {
      text: say(lang, "Your order is empty. Tell me what you'd like, e.g. “2 cappuccinos and a butter croissant”.", "طلبك فاضي. قولي تحب إيه، مثلًا «٢ كابتشينو وكرواسون بالزبدة»."),
      chips: GUEST_CHIPS[lang].slice(0, 3),
    };
  const open = act.openDineInOrder();
  const table = act.currentTableLabel();
  if (!open && !table) return { text: say(lang, "Almost there! Which table are you at?", "قربنا! إنت على أنهي طاولة؟"), chips: tableChips(lang) };

  const total = totals(cart, v.settings, "dine_in").total;
  const lines = cart.map((l) => `${l.quantity}× ${L(l.name)}`).join(", ");
  return {
    text: say(lang, "Here's your order. Tap **Place order** and I'll send it straight to the kitchen:", "ده طلبك. دوس **اطلب الآن** وهبعته للمطبخ على طول:"),
    cards: [
      {
        kind: "confirm",
        title: open ? say(lang, `Add to order #${open.number} · ${m(total)}`, `إضافة لطلب #${open.number} · ${m(total)}`) : say(lang, `Table ${table} · ${m(total)}`, `طاولة ${table} · ${m(total)}`),
        detail: `${lines}\n${say(lang, "Incl. service & VAT · pay at the counter or by card", "شامل الخدمة والضريبة · الدفع كاش أو فيزا")}`,
        confirmLabel: say(lang, "Place order", "اطلب الآن"),
        cancelLabel: say(lang, "Not yet", "لسه"),
        run: () => {
          const o = act.placeOrderFromCart();
          if (!o) return say(lang, "Hmm, your order is empty now.", "طلبك بقى فاضي.");
          return {
            text: say(
              lang,
              `Sent to the kitchen ✅ Order **#${o.number}**, ready in about ${act.orderEta(o)} min. Ask me “where's my order?” anytime.`,
              `اتبعت للمطبخ ✅ طلب رقم **#${o.number}**، هيبقى جاهز في حوالي ${act.orderEta(o)} دقيقة. اسألني «طلبي فين؟» في أي وقت.`,
            ),
            cards: [{ kind: "order", orderId: o.id }],
            lang,
          };
        },
      },
    ],
  };
}
