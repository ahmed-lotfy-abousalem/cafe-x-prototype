"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, Clock, PencilLine, Trash2, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { totals } from "@/lib/seed";
import { requestBlock, useVenue } from "@/lib/store";
import { MAX_GUEST_REQUESTS, type Order, type OrderLine } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, Segmented, Sheet, Stepper, Textarea } from "@/components/ui";

/**
 * Guests never edit or cancel an order themselves: they send a request and staff decide.
 * Requests are allowed until the kitchen starts preparing; one open at a time, three per order.
 */
export default function OrderRequests({ order, onCallWaiter }: { order: Order; onCallWaiter: () => void }) {
  const { L, m, n, lang } = useT();
  const settings = useVenue((s) => s.settings);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"change" | "cancel">("change");
  const [lines, setLines] = useState<OrderLine[]>(order.items);
  const [note, setNote] = useState("");

  if (order.status === "cancelled" || order.status === "served") return null;
  const reqs = order.requests ?? [];
  const latest = reqs[reqs.length - 1];
  const block = requestBlock(order);
  const ar = lang === "ar";

  const start = (k: "change" | "cancel") => {
    setKind(k);
    setLines(order.items);
    setNote("");
    setOpen(true);
  };
  const changed = lines.length !== order.items.length || lines.some((l) => order.items.find((o) => o.lineId === l.lineId)?.quantity !== l.quantity);
  const newTotal = totals(lines, settings, order.type).total;
  const send = () => {
    useVenue.getState().requestChange(order.id, kind === "cancel" ? { kind, note } : { kind, lines, note });
    setOpen(false);
  };

  return (
    <div className="mx-4 mt-4 rounded-3xl bg-white p-5 shadow-card">
      <p className="font-bold">{L({ en: "Need to change your order?", ar: "محتاج تغيّر طلبك؟" })}</p>

      {latest && (
        <div
          className={cn(
            "mt-3 flex gap-3 rounded-2xl p-3 text-sm",
            latest.status === "pending" && "bg-amber-50 text-amber-800",
            latest.status === "approved" && "bg-sage-50 text-sage",
            latest.status === "declined" && "bg-red-50 text-red-700",
          )}
        >
          {latest.status === "pending" ? <Clock className="size-5 shrink-0" /> : latest.status === "approved" ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
          <div>
            <p className="font-bold">
              {latest.status === "pending"
                ? L({ en: "Request sent", ar: "تم إرسال الطلب" })
                : latest.status === "approved"
                  ? L({ en: "Approved", ar: "تمت الموافقة" })
                  : L({ en: "Declined", ar: "تم الرفض" })}
              <span className="font-normal opacity-80"> · {latest.kind === "cancel" ? L({ en: "cancel order", ar: "إلغاء الطلب" }) : L({ en: "change items", ar: "تعديل الأصناف" })}</span>
            </p>
            <p className="opacity-80">
              {latest.status === "pending"
                ? L({ en: "Our team will review it shortly.", ar: "الفريق هيراجعه حالًا." })
                : latest.status === "declined" && latest.reason
                  ? latest.reason
                  : latest.status === "approved" && latest.kind === "change"
                    ? L({ en: "Your order and bill were updated.", ar: "طلبك وحسابك اتحدّثوا." })
                    : ""}
            </p>
          </div>
        </div>
      )}

      {block === "kitchen_started" ? (
        <div className="mt-3 flex items-center gap-3 text-sm text-muted">
          <p className="flex-1">{L({ en: "The kitchen has started your order, so changes go through our team.", ar: "المطبخ بدأ في طلبك، فأي تعديل يكون عن طريق الفريق." })}</p>
          <Button variant="soft" size="sm" onClick={onCallWaiter}>
            <BellRing className="size-4" /> {L({ en: "Ask our team", ar: "كلّم الفريق" })}
          </Button>
        </div>
      ) : block === "limit_reached" ? (
        <p className="mt-3 text-sm text-muted">{L({ en: `You've sent ${MAX_GUEST_REQUESTS} requests for this order. Please ask our team for anything else.`, ar: `بعت ${n(MAX_GUEST_REQUESTS)} طلبات للطلب ده. لأي حاجة تانية كلّم الفريق.` })}</p>
      ) : block === null ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => start("change")}>
            <PencilLine className="size-4" /> {L({ en: "Request a change", ar: "اطلب تعديل" })}
          </Button>
          <Button variant="outline" className="text-red-600" onClick={() => start("cancel")}>
            <XCircle className="size-4" /> {L({ en: "Request to cancel", ar: "اطلب إلغاء" })}
          </Button>
          <p className="col-span-2 text-xs text-muted">
            {L({ en: "Staff approve or decline each request. Possible until the kitchen starts.", ar: "الفريق بيوافق أو يرفض كل طلب. متاح لحد ما المطبخ يبدأ." })}
          </p>
        </div>
      ) : null}

      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="p-6">
          <h3 className="font-display text-2xl font-semibold">{L({ en: "Send a request", ar: "ابعت طلب" })}</h3>
          <Segmented
            className="mt-4"
            value={kind}
            onChange={setKind}
            options={[
              { value: "change", label: L({ en: "Change items", ar: "تعديل الأصناف" }) },
              { value: "cancel", label: L({ en: "Cancel order", ar: "إلغاء الطلب" }) },
            ]}
          />
          {kind === "change" && (
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line">
              {order.items.map((orig) => {
                const cur = lines.find((l) => l.lineId === orig.lineId);
                return (
                  <div key={orig.lineId} className={cn("flex items-center gap-3 p-3", !cur && "opacity-50")}>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className={cn("font-semibold", !cur && "line-through")}>{L(orig.name)}</p>
                      {orig.modifiers.length > 0 && <p className="truncate text-xs text-muted">{orig.modifiers.map((x) => L(x.name)).join(" · ")}</p>}
                    </div>
                    {cur ? (
                      <>
                        {/* Guests can lower quantities or remove lines; adding goes through "Order more". */}
                        <Stepper size="sm" value={cur.quantity} min={1} onChange={(q) => q <= orig.quantity && setLines((ls) => ls.map((l) => (l.lineId === orig.lineId ? { ...l, quantity: q } : l)))} />
                        <button onClick={() => setLines((ls) => ls.filter((l) => l.lineId !== orig.lineId))} className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Remove">
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setLines((ls) => [...ls, orig])} className="text-xs font-semibold text-brand-700">{L({ en: "Undo", ar: "تراجع" })}</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {kind === "change" && changed && lines.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              {L({ en: "New total if approved", ar: "الإجمالي الجديد لو اتوافق" })}: <b className="text-ink">{m(newTotal)}</b> <span className="line-through">{m(order.total)}</span>
            </p>
          )}
          <Textarea className="mt-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={L({ en: "Add a note for the team (optional)", ar: "ملاحظة للفريق (اختياري)" })} />
          <Button
            size="lg"
            variant={kind === "cancel" ? "danger" : "primary"}
            className="mt-4 w-full"
            disabled={kind === "change" && (!changed || lines.length === 0)}
            onClick={send}
          >
            {kind === "cancel" ? L({ en: "Send cancel request", ar: "ابعت طلب الإلغاء" }) : L({ en: "Send change request", ar: "ابعت طلب التعديل" })}
          </Button>
          {kind === "change" && lines.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted">{L({ en: "Removing everything? Choose “Cancel order” instead.", ar: "هتشيل كل حاجة؟ اختار «إلغاء الطلب»." })}</p>
          )}
          <p className="mt-3 text-center text-xs text-muted">
            {ar ? `طلب واحد مفتوح في المرة · حد أقصى ${n(MAX_GUEST_REQUESTS)} طلبات` : `One open request at a time · up to ${MAX_GUEST_REQUESTS} per order`}
          </p>
        </div>
      </Sheet>
    </div>
  );
}
