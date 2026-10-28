"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { guestReply, guestWelcome } from "@/lib/assistant/guest";
import { ownerReply, ownerWelcome } from "@/lib/assistant/owner";
import { useDevice, useVenue } from "@/lib/store";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui";
import { AssistantPanel, useAssistant } from "./Assistant";
import { useStaffUser } from "@/components/staff/StaffShell";

/** Floating "Ask us" button + bottom-sheet chat for guests (menu & tracking pages). */
export function GuestAssistant({ className, onCustomize }: { className?: string; onCustomize?: (item: MenuItem) => void }) {
  const lang = useDevice((s) => s.lang);
  const venue = useVenue((s) => s.settings.venueName);
  const [open, setOpen] = useState(false);
  const state = useAssistant((t) => guestReply(t, lang), () => guestWelcome(lang));
  const ar = lang === "ar";

  return (
    <>
      <button
        onClick={() => {
          state.start();
          setOpen(true);
        }}
        className={cn("fixed end-4 z-30 flex h-14 items-center gap-2 rounded-full bg-ink ps-4 pe-5 font-bold text-cream shadow-float transition active:scale-95", className)}
      >
        <Sparkles className="size-5 text-brand-100" />
        {ar ? "اسألنا" : "Ask us"}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} className="overflow-hidden">
        <div className="h-[85dvh] sm:h-[640px]">
          <AssistantPanel
            state={state}
            lang={lang}
            dark
            title={ar ? `مساعد ${venue}` : `${venue} assistant`}
            subtitle={ar ? "بيرد فورًا · عربي و English" : "Replies instantly · English & العربية"}
            placeholder={ar ? "اكتب سؤالك…" : "Ask about the menu, allergens, your order…"}
            onClose={() => setOpen(false)}
            onCustomize={onCustomize ? (i) => { setOpen(false); onCustomize(i); } : undefined}
          />
        </div>
      </Sheet>
    </>
  );
}

/** Business assistant for owners/managers, docked on the right of the admin panel. */
export function OwnerAssistant() {
  const user = useStaffUser();
  const [open, setOpen] = useState(false);
  const state = useAssistant(ownerReply, () => ownerWelcome(user?.name.split(" ")[0] ?? "there"));

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            state.start();
            setOpen(true);
          }}
          className="fixed end-6 bottom-6 z-40 flex h-12 items-center gap-2 rounded-full bg-brand ps-4 pe-5 text-sm font-bold text-white shadow-float transition hover:bg-brand-600 active:scale-95"
        >
          <Sparkles className="size-5" /> Ask your assistant
        </button>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 end-0 z-50 w-full max-w-md animate-fade border-s border-line shadow-float">
            <AssistantPanel
              state={state}
              lang="en"
              title="Business assistant"
              subtitle="Sales · menu · operations · asks before changing anything"
              placeholder="e.g. How did we do this week?"
              onClose={() => setOpen(false)}
            />
          </aside>
        </>
      )}
    </>
  );
}
