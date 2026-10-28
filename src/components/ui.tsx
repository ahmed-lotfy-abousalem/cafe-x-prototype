"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDevice } from "@/lib/store";
import type { LinkIcon, OrderStatus } from "@/lib/types";

/* ---------- Buttons ---------- */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-14 px-6 text-base",
        variant === "primary" && "bg-brand text-white shadow-sm hover:bg-brand-600",
        variant === "dark" && "bg-ink text-cream hover:bg-ink/90",
        variant === "outline" && "border border-line bg-white text-ink hover:bg-sand/60",
        variant === "ghost" && "text-ink-soft hover:bg-sand/70",
        variant === "soft" && "bg-brand-50 text-brand-700 hover:bg-brand-100",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
    />
  );
}

export function IconButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn("grid size-10 place-items-center rounded-full transition hover:bg-sand active:scale-95", className)}
    />
  );
}

/* ---------- Badges ---------- */

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "green" | "red" | "amber" | "blue" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        tone === "neutral" && "bg-sand text-ink-soft",
        tone === "brand" && "bg-brand-50 text-brand-700",
        tone === "green" && "bg-sage-50 text-sage",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "amber" && "bg-amber-50 text-amber-700",
        tone === "blue" && "bg-sky-50 text-sky-700",
        tone === "dark" && "bg-ink text-cream",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<OrderStatus, "blue" | "amber" | "green" | "neutral" | "red"> = {
  received: "blue",
  preparing: "amber",
  ready: "green",
  served: "neutral",
  cancelled: "red",
};

/* ---------- Overlays ---------- */

function useEsc(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

/** Bottom sheet on phones, centered card on larger screens. */
export function Sheet({
  open,
  onClose,
  children,
  className,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  useEsc(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          "relative max-h-[92dvh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-white shadow-float sm:animate-pop sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Right-side drawer for admin editing. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEsc(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 animate-fade bg-ink/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl animate-fade flex-col bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <IconButton onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEsc(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 animate-fade bg-ink/40" onClick={onClose} />
      <div className={cn("relative w-full animate-pop rounded-2xl bg-white shadow-float", wide ? "max-w-3xl" : "max-w-md")}>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <IconButton onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Form controls ---------- */

export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors",
        size === "md" ? "h-6 w-11" : "h-5 w-9",
        checked ? "bg-sage" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 rounded-full bg-white shadow transition-all",
          size === "md" ? "size-5" : "size-4",
          checked ? (size === "md" ? "start-[22px]" : "start-[18px]") : "start-0.5",
        )}
      />
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

/** Lets a caller's width class (w-36, w-24…) replace the default full width. */
const base = (className?: string) => (/(^|\s)w-/.test(className ?? "") ? inputCls.replace("w-full ", "") : inputCls);

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn(base(p.className), p.className)} />;
}

export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...p} className={cn(inputCls, "resize-none", p.className)} />;
}

export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={cn(base(p.className), "appearance-auto", p.className)} />;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "size-8" : "size-10";
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-sand p-1">
      <button type="button" className={cn(s, "grid place-items-center rounded-full bg-white shadow-sm active:scale-90 disabled:opacity-40")} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
        <Minus className="size-4" />
      </button>
      <span className="min-w-7 text-center font-bold tabular-nums">{value}</span>
      <button type="button" className={cn(s, "grid place-items-center rounded-full bg-ink text-cream shadow-sm active:scale-90")} onClick={() => onChange(value + 1)} aria-label="Increase">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-2xl bg-sand p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
            value === o.value ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>{children}</div>;
}

/* ---------- Brand ---------- */

export function Logo({ size = 48, className, light }: { size?: number; className?: string; light?: boolean }) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[30%] font-display font-bold",
        light ? "bg-cream text-ink" : "bg-ink text-cream",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.48 }}
    >
      <span className="-mt-[6%]">X</span>
      <span className="absolute bottom-[14%] h-[6%] w-[30%] rounded-full bg-brand" />
    </div>
  );
}

export function LangToggle({ className, dark }: { className?: string; dark?: boolean }) {
  const lang = useDevice((s) => s.lang);
  const setLang = useDevice((s) => s.setLang);
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className={cn(
        "h-9 rounded-full px-3 text-sm font-bold transition",
        dark ? "bg-white/15 text-white backdrop-blur hover:bg-white/25" : "bg-sand text-ink hover:bg-line",
        className,
      )}
    >
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}

/** Image with a graceful branded fallback if the photo can't load. */
export function ItemImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src)
    return (
      <div className={cn("grid place-items-center bg-gradient-to-br from-brand-100 to-sand text-3xl", className)} aria-label={alt}>
        ☕
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn("object-cover", className)} />;
}

/* ---------- Social / link icons (inline SVG, no brand-icon dependency) ---------- */

export function LinkGlyph({ icon, className }: { icon: LinkIcon; className?: string }) {
  const c = cn("size-5", className);
  switch (icon) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor">
          <path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="currentColor">
          <path d="M16 3c.4 2.3 1.8 3.8 4 4v3.2c-1.5 0-2.9-.5-4-1.2V15a6 6 0 1 1-6-6v3.3a2.8 2.8 0 1 0 2.8 2.7V3H16z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1z" strokeLinejoin="round" />
          <path d="M9 9.5c.3 2 2.2 4.2 4.8 5l1.2-1.3 2 .9c-.2 1-1 1.7-2.1 1.7C11.6 15.8 8 12.2 8 9.9c0-1 .8-1.9 1.7-2.1l.9 2-1.6-.3z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "maps":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "delivery":
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="17" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <path d="M8.5 17h7M3 9h8l2 5M15 6h2l3.5 8.5M11 9V6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" />
        </svg>
      );
  }
}

export function EmptyState({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-sand text-3xl">{icon}</div>
      <p className="font-bold">{title}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toast({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="animate-pop rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-float">{children}</div>
    </div>
  );
}

export function useToast(ms = 2200) {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), ms);
    return () => clearTimeout(id);
  }, [msg, ms]);
  return { msg, show: setMsg, node: <Toast show={!!msg}>{msg}</Toast> };
}
