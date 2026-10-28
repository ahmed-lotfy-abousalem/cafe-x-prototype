"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Plus, SendHorizontal, ShoppingBag, Sparkles, X } from "lucide-react";
import * as act from "@/lib/assistant/actions";
import type { BotReply, ChatCard } from "@/lib/assistant/nlp";
import { money, statusLabel } from "@/lib/i18n";
import { useVenue } from "@/lib/store";
import type { Lang, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ItemImage } from "@/components/ui";

type Msg = BotReply & { id: string; from: "user" | "bot" };
const uid = () => Math.random().toString(36).slice(2, 9);

/** Shared chat state; lives in the wrapper so the conversation survives closing the panel. */
export function useAssistant(engine: (text: string) => BotReply, welcome: () => BotReply) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    setMessages([{ id: uid(), from: "bot", ...welcome() }]);
  };

  const push = (m: BotReply, from: Msg["from"] = "bot") => setMessages((ms) => [...ms, { id: uid(), from, ...m }]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    push({ text: clean }, "user");
    setTyping(true);
    // Small, length-based delay so the demo feels like a real assistant thinking.
    setTimeout(() => {
      push(engine(clean));
      setTyping(false);
    }, 550 + Math.min(700, clean.length * 12));
  };

  return { messages, typing, send, push, start };
}

export type AssistantState = ReturnType<typeof useAssistant>;

export function AssistantPanel({
  state,
  title,
  subtitle,
  lang,
  placeholder,
  onClose,
  onCustomize,
  dark,
}: {
  state: AssistantState;
  title: string;
  subtitle: string;
  lang: Lang;
  placeholder: string;
  onClose: () => void;
  onCustomize?: (item: MenuItem) => void;
  dark?: boolean;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.messages.length, state.typing]);

  const lastBot = [...state.messages].reverse().find((m) => m.from === "bot");

  return (
    <div className="flex h-full flex-col bg-cream">
      <div className={cn("flex items-center gap-3 px-4 py-3", dark ? "bg-ink text-cream" : "border-b border-line bg-white")}>
        <span className="relative grid size-10 place-items-center rounded-full bg-brand text-white">
          <Sparkles className="size-5" />
          <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div className="flex-1 leading-tight">
          <p className="font-bold">{title}</p>
          <p className={cn("text-xs", dark ? "text-cream/60" : "text-muted")}>{subtitle}</p>
        </div>
        <button onClick={onClose} className={cn("grid size-9 place-items-center rounded-full", dark ? "hover:bg-white/10" : "hover:bg-sand")} aria-label="Close">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {state.messages.map((m) => (
          <div key={m.id} className={cn("flex animate-fade flex-col", m.from === "user" ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                m.from === "user" ? "rounded-ee-md bg-ink text-cream" : "rounded-es-md bg-white text-ink shadow-card",
              )}
            >
              <RichText text={m.text} />
            </div>
            {m.cards?.map((c, i) => (
              <div key={i} className="mt-2 w-full max-w-[92%]">
                <Card card={c} lang={m.lang ?? lang} onCustomize={onCustomize} onResult={(r) => state.push(typeof r === "string" ? { text: r } : r)} onSend={state.send} />
              </div>
            ))}
          </div>
        ))}
        {state.typing && (
          <div className="flex w-fit gap-1 rounded-2xl rounded-es-md bg-white px-4 py-3.5 shadow-card">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 animate-bounce rounded-full bg-muted/60" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {lastBot?.chips && !state.typing && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {lastBot.chips.map((c) => (
            <button key={c} onClick={() => state.send(c.replace(/^\p{Extended_Pictographic}\s*/u, ""))} className="shrink-0 rounded-full border border-brand/30 bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
              {c}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          state.send(input);
          setInput("");
        }}
        className="flex items-center gap-2 border-t border-line bg-white px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-full bg-sand px-4 text-sm outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button type="submit" disabled={!input.trim() || state.typing} className="grid size-11 place-items-center rounded-full bg-brand text-white transition active:scale-95 disabled:opacity-40" aria-label="Send">
          <SendHorizontal className="size-5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}

/** **bold** and _italic_ only: enough for bot replies, no HTML injection. */
function RichText({ text }: { text: string }) {
  // One block per line with dir="auto", so Arabic and English lines each read the right way.
  return (
    <>
      {text.split("\n").map((line, li) => (
        <span key={li} dir="auto" className="block min-h-[0.75em]">
          <Inline text={line} />
        </span>
      ))}
    </>
  );
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : part.startsWith("_") && part.endsWith("_") && part.length > 2 ? (
          <em key={i} className="text-muted">{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Card({ card, lang, onCustomize, onResult, onSend }: { card: ChatCard; lang: Lang; onCustomize?: (i: MenuItem) => void; onResult: (r: string | BotReply) => void; onSend: (text: string) => void }) {
  const router = useRouter();
  const items = useVenue((s) => s.items);
  const orders = useVenue((s) => s.orders);
  const currency = useVenue((s) => s.settings.currency);
  const [added, setAdded] = useState<Record<string, boolean>>(() =>
    card.kind === "items" && card.added ? Object.fromEntries(card.itemIds.map((id) => [id, true])) : {},
  );
  const [decided, setDecided] = useState<"yes" | "no" | null>(null);
  const L = (x: { en: string; ar: string }) => x[lang] || x.en;
  const m = (n: number) => money(n, lang, currency);
  const ar = lang === "ar";

  if (card.kind === "items") {
    const list = card.itemIds.map((id) => items.find((i) => i.id === id)).filter((x): x is MenuItem => !!x);
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {list.map((it) => {
          const q = card.qty?.[it.id] ?? 1;
          const customizable = it.modifierGroups.length > 0 && onCustomize;
          return (
            <div key={it.id} className="flex items-center gap-3 border-b border-line p-2.5 last:border-0">
              <ItemImage src={it.image} alt="" className={cn("size-14 shrink-0 rounded-xl", !it.available && "grayscale")} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{L(it.name)}</p>
                <p className="text-sm font-semibold text-brand-700">{m(it.price)}{q > 1 && <span className="text-muted"> × {q}</span>}</p>
                {customizable && it.available && (
                  <button onClick={() => onCustomize!(it)} className="text-xs font-semibold text-muted underline-offset-2 hover:underline">
                    {ar ? "تخصيص الإضافات" : "Customise"}
                  </button>
                )}
              </div>
              {!it.available ? (
                <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-bold text-muted">{ar ? "خلص" : "Sold out"}</span>
              ) : added[it.id] ? (
                <span className="flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold text-sage"><Check className="size-3.5" /> {ar ? "اتضاف" : "Added"}</span>
              ) : (
                <button
                  onClick={() => {
                    if (act.addToCart(it.id, q)) setAdded((a) => ({ ...a, [it.id]: true }));
                  }}
                  className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-cream active:scale-95"
                >
                  <Plus className="size-3.5" /> {ar ? "أضف" : "Add"}
                </button>
              )}
            </div>
          );
        })}
        {Object.keys(added).length > 0 && !card.added && (
          <div className="flex">
            <button onClick={() => router.push("/m/cafe-x/checkout")} className="flex flex-1 items-center justify-center gap-2 bg-sand py-2.5 text-sm font-bold text-ink">
              <ShoppingBag className="size-4" /> {ar ? "عرض الطلب" : "View order"}
            </button>
            <button onClick={() => onSend(ar ? "ابعت الطلب" : "Place my order")} className="flex flex-1 items-center justify-center gap-2 bg-brand py-2.5 text-sm font-bold text-white">
              <Sparkles className="size-4" /> {ar ? "اطلبلي دلوقتي" : "Order it for me"}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (card.kind === "order") {
    const o = orders.find((x) => x.id === card.orderId);
    if (!o) return null;
    return (
      <Link href={`/track?id=${o.id}`} className="flex items-center gap-3 rounded-2xl bg-ink p-3 text-cream">
        <span className="font-display text-2xl font-semibold">#{o.number}</span>
        <span className="flex-1 text-sm">{L(statusLabel[o.status])} · {m(o.total)}</span>
        <span className="flex items-center text-xs font-bold">{ar ? "تتبع" : "Track"} <ChevronRight className="size-4 rtl:rotate-180" /></span>
      </Link>
    );
  }

  if (card.kind === "cart")
    return (
      <button onClick={() => router.push("/m/cafe-x/checkout")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-bold text-white">
        <ShoppingBag className="size-4" /> {ar ? "عرض الطلب والدفع" : "View order & checkout"}
      </button>
    );

  if (card.kind === "stats")
    return (
      <div className="rounded-2xl border border-line bg-white p-3">
        {card.title && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{card.title}</p>}
        <dl className="space-y-1.5 text-sm">
          {card.rows.map(([k, val]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="text-end font-bold tabular-nums">{val}</dd>
            </div>
          ))}
        </dl>
      </div>
    );

  // confirm
  return (
    <div className={cn("rounded-2xl border-2 bg-white p-3.5", decided === "yes" ? "border-sage/40" : decided === "no" ? "border-line opacity-60" : "border-brand/40")}>
      <p className="font-bold">{card.title}</p>
      {card.detail && <p className="mt-0.5 text-xs whitespace-pre-line text-muted">{card.detail}</p>}
      {decided ? (
        <p className={cn("mt-2 text-xs font-bold", decided === "yes" ? "text-sage" : "text-muted")}>{decided === "yes" ? (ar ? "✓ تم" : "✓ Confirmed") : ar ? "اتلغى" : "Cancelled"}</p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setDecided("yes");
              onResult(card.run());
            }}
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white active:scale-95"
          >
            {card.confirmLabel}
          </button>
          <button
            onClick={() => {
              setDecided("no");
              onResult({ text: ar ? "ولا يهمك، محدش اتبعت حاجة. تحب تضيف حاجة؟" : "No problem, nothing was sent or changed.", lang });
            }}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink-soft hover:bg-sand"
          >
            {card.cancelLabel ?? (ar ? "إلغاء" : "Cancel")}
          </button>
        </div>
      )}
    </div>
  );
}
