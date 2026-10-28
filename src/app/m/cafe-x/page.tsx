"use client";

import { useShallow } from "zustand/react/shallow";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, ChevronRight, Clock, Flame, Leaf, Plus, Receipt, Search, ShoppingBag, Sparkles, UtensilsCrossed, X } from "lucide-react";
import { tagLabel, useT } from "@/lib/i18n";
import { useDevice, useTable, useVenue } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, ItemImage, LangToggle, Logo, Sheet, useToast } from "@/components/ui";
import ItemSheet from "@/components/customer/ItemSheet";
import { GuestAssistant } from "@/components/chat/Assistants";
import { useActiveOrder, useTableFromUrl } from "@/components/customer/shared";

export default function MenuPage() {
  useTableFromUrl();
  const router = useRouter();
  const { t, L, m, n, lang } = useT();
  const categories = useVenue(useShallow((s) => s.categories.filter((c) => c.active)));
  const items = useVenue((s) => s.items);
  const settings = useVenue((s) => s.settings);
  const cart = useDevice((s) => s.cart);
  const table = useTable();
  const activeOrder = useActiveOrder();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const tabsRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      items.filter(
        (i) =>
          categories.some((c) => c.id === i.categoryId) &&
          (!q || i.name.en.toLowerCase().includes(q) || i.name.ar.includes(q) || i.description.en.toLowerCase().includes(q)),
      ),
    [items, categories, q],
  );
  const popular = items.filter((i) => i.tags.includes("popular") && i.available);
  const cartCount = cart.reduce((a, l) => a + l.quantity, 0);
  const cartTotal = cart.reduce((a, l) => a + l.unitPrice * l.quantity, 0);

  // Scroll-spy: highlight the category tab whose section is in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveCat(hit.target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    document.querySelectorAll("[data-cat-section]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [visible.length]);

  useEffect(() => {
    tabsRef.current?.querySelector(`[data-tab="${activeCat}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeCat]);

  const jump = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 118, behavior: "smooth" });
  };

  const requestHelp = (kind: "waiter" | "bill") => {
    useVenue.getState().addRequest(table?.label ?? "?", kind);
    setHelpOpen(false);
    toast.show(kind === "waiter" ? t("waiterOnWay") : t("billOnWay"));
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream pb-40 sm:my-0 sm:shadow-[0_0_0_1px_var(--color-line)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <Link href={`/l/cafe-x${table ? `?t=${table.token}` : ""}`} className="grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Back">
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
          {searching ? (
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 shadow-card">
              <Search className="size-4 text-muted" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchMenu")} className="h-10 flex-1 bg-transparent text-sm outline-none" />
              <button onClick={() => { setQuery(""); setSearching(false); }} aria-label="Clear"><X className="size-4 text-muted" /></button>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center gap-2.5">
                <Logo size={34} />
                <div className="leading-tight">
                  <p className="font-display text-lg font-semibold">{settings.venueName}</p>
                  {table ? (
                    <p className="flex items-center gap-1 text-xs font-semibold text-brand-700">
                      <UtensilsCrossed className="size-3" /> {t("table")} {table.label}
                    </p>
                  ) : (
                    <p className="max-w-44 truncate text-xs text-muted">{L(settings.tagline)}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSearching(true)} className="grid size-10 place-items-center rounded-full hover:bg-sand" aria-label="Search">
                <Search className="size-5" />
              </button>
              <LangToggle />
            </>
          )}
        </div>
        {/* Category tabs */}
        {!q && (
          <div ref={tabsRef} className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line px-4 pt-1 pb-3">
            {categories.map((c) => (
              <button
                key={c.id}
                data-tab={c.id}
                onClick={() => jump(c.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                  activeCat === c.id ? "bg-ink text-cream shadow" : "bg-white text-ink-soft shadow-card hover:text-ink",
                )}
              >
                <span>{c.icon}</span>
                {L(c.name)}
              </button>
            ))}
          </div>
        )}
      </header>

      {!settings.acceptingOrders && (
        <div className="mx-4 mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">{t("closedForOrders")}</div>
      )}

      {activeOrder && (
        <Link href={`/track?id=${activeOrder.id}`} className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-ink p-3.5 text-cream shadow-float">
          <span className="relative grid size-10 place-items-center rounded-xl bg-white/10">
            <Receipt className="size-5" />
            <span className="absolute -top-0.5 -end-0.5 size-2.5 animate-pulse rounded-full bg-brand" />
          </span>
          <span className="flex-1 text-sm">
            <span className="block font-bold">{t("orderNumber")} #{n(activeOrder.number)}</span>
            <span className="text-cream/70">{L({ en: "Tap to track live", ar: "اضغط للمتابعة مباشرة" })}</span>
          </span>
          <ChevronRight className="size-5 rtl:rotate-180" />
        </Link>
      )}

      {!q && (
        <>
          {/* Promo banner */}
          <div className="relative mx-4 mt-4 overflow-hidden rounded-3xl bg-ink text-cream">
            <ItemImage src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=900&q=70&auto=format&fit=crop" alt="" className="absolute inset-0 h-full w-full opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent rtl:bg-gradient-to-l" />
            <div className="relative p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white"><Sparkles className="size-3" /> {L({ en: "Today", ar: "اليوم" })}</span>
              <p className="mt-2 font-display text-2xl font-semibold">{t("promoTitle")}</p>
              <p className="mt-1 max-w-[16rem] text-sm text-cream/80">{t("promoSub")}</p>
            </div>
          </div>

          {/* Popular carousel */}
          <section className="mt-6">
            <h2 className="flex items-center gap-2 px-4 text-lg font-bold">
              <Flame className="size-5 text-brand" /> {t("popular")}
            </h2>
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
              {popular.map((i) => (
                <button key={i.id} onClick={() => setOpenItem(i)} className="w-40 shrink-0 overflow-hidden rounded-2xl bg-white text-start shadow-card transition active:scale-[0.98]">
                  <ItemImage src={i.image} alt={L(i.name)} className="h-28 w-full" />
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">{L(i.name)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-brand-700">{m(i.price)}</span>
                      <span className="grid size-7 place-items-center rounded-full bg-ink text-cream"><Plus className="size-4" /></span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Menu sections */}
      <div className="mt-2">
        {categories.map((c) => {
          const list = visible.filter((i) => i.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} id={`cat-${c.id}`} data-cat-section className="px-4 pt-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <span>{c.icon}</span> {L(c.name)}
                <span className="text-sm font-normal text-muted">({n(list.length)})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {list.map((i) => (
                  <MenuRow key={i.id} item={i} onOpen={() => setOpenItem(i)} />
                ))}
              </div>
            </section>
          );
        })}
        {q && visible.length === 0 && (
          <div className="py-20 text-center text-muted">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-semibold">{t("noResults")}</p>
          </div>
        )}
      </div>

      <GuestAssistant className={cn("end-[5.25rem] sm:end-[calc(50%-14rem+5.25rem)]", cartCount ? "bottom-24" : "bottom-6")} onCustomize={setOpenItem} />

      {/* Help FAB */}
      <button
        onClick={() => setHelpOpen(true)}
        className={cn("fixed end-4 z-30 grid size-14 place-items-center rounded-full bg-white text-ink shadow-float transition active:scale-95 sm:end-[calc(50%-14rem+1rem)]", cartCount ? "bottom-24" : "bottom-6")}
        aria-label={t("callWaiter")}
      >
        <BellRing className="size-6" />
      </button>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-4">
          <button onClick={() => router.push("/m/cafe-x/checkout")} className="flex w-full animate-pop items-center gap-3 rounded-2xl bg-brand p-2 ps-2 pe-5 text-white shadow-float transition active:scale-[0.98]">
            <span className="relative grid size-11 place-items-center rounded-xl bg-white/20">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1.5 -end-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold">{n(cartCount)}</span>
            </span>
            <span className="flex-1 text-start font-bold">{t("viewOrder")}</span>
            <span className="font-bold">{m(cartTotal)}</span>
          </button>
        </div>
      )}

      <ItemSheet item={openItem} onClose={() => setOpenItem(null)} onAdded={() => { setOpenItem(null); toast.show(lang === "ar" ? "تمت الإضافة للطلب ✓" : "Added to your order ✓"); }} />

      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)}>
        <div className="p-6">
          <h3 className="font-display text-2xl font-semibold">{t("needHelp")}</h3>
          <p className="mt-1 text-sm text-muted">{table ? `${t("table")} ${table.label} · ${table.zone}` : t("selectTable")}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => requestHelp("waiter")} className="flex flex-col items-center gap-3 rounded-2xl border border-line p-5 font-semibold transition hover:border-brand hover:bg-brand-50">
              <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"><BellRing className="size-7" /></span>
              {t("callWaiter")}
            </button>
            <button onClick={() => requestHelp("bill")} className="flex flex-col items-center gap-3 rounded-2xl border border-line p-5 font-semibold transition hover:border-brand hover:bg-brand-50">
              <span className="grid size-14 place-items-center rounded-full bg-sage-50 text-sage"><Receipt className="size-7" /></span>
              {t("requestBill")}
            </button>
          </div>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setHelpOpen(false)}>
            {lang === "ar" ? "إغلاق" : "Close"}
          </Button>
        </div>
      </Sheet>

      {toast.node}
    </div>
  );
}

function MenuRow({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  const { t, L, m } = useT();
  const off = !item.available;
  return (
    <button
      onClick={onOpen}
      disabled={off}
      className={cn("flex w-full gap-3 rounded-2xl bg-white p-3 text-start shadow-card transition active:scale-[0.99]", off && "opacity-60")}
    >
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.slice(0, 2).map((tg) => (
            <Badge key={tg} tone={tg === "popular" || tg === "chef" ? "brand" : tg === "new" ? "blue" : tg === "spicy" ? "red" : "green"}>
              {tg === "spicy" && <Flame className="size-3" />}
              {(tg === "vegan" || tg === "vegetarian") && <Leaf className="size-3" />}
              {L(tagLabel[tg])}
            </Badge>
          ))}
        </div>
        <p className="mt-1 font-bold leading-snug">{L(item.name)}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">{L(item.description)}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-brand-700">{m(item.price)}</span>
          {item.schedule !== "all_day" && (
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Clock className="size-3" />
              {item.schedule === "breakfast" ? t("breakfastOnly") : t("eveningOnly")}
            </span>
          )}
        </div>
      </div>
      <div className="relative shrink-0">
        <ItemImage src={item.image} alt={L(item.name)} className={cn("size-28 rounded-xl", off && "grayscale")} />
        {off ? (
          <span className="absolute inset-x-1 bottom-1 rounded-lg bg-ink/85 py-1 text-center text-[11px] font-bold text-cream">{t("soldOut")}</span>
        ) : (
          <span className="absolute -bottom-1.5 -end-1.5 grid size-9 place-items-center rounded-full border-4 border-white bg-ink text-cream">
            <Plus className="size-4" />
          </span>
        )}
      </div>
    </button>
  );
}
