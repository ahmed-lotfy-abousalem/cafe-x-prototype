"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowUp, Copy, FileSpreadsheet, ImagePlus, LayoutGrid, List, Pencil, Plus, Search, Trash2, Upload, X,
} from "lucide-react";
import { allergenLabel, tagLabel } from "@/lib/i18n";
import { useVenue } from "@/lib/store";
import type { Allergen, Category, MenuItem, ModifierGroup, Tag } from "@/lib/types";
import { cn, downloadText, egp } from "@/lib/utils";
import { Badge, Button, Card, Drawer, Field, Input, ItemImage, Modal, Select, Textarea, Toggle, useToast } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;
const TAGS: Tag[] = ["popular", "new", "chef", "spicy", "vegetarian", "vegan"];
const ALLERGENS: Allergen[] = ["dairy", "gluten", "eggs", "nuts", "soy", "fish"];

const blankItem = (categoryId: string): MenuItem => ({
  id: uid("itm"),
  categoryId,
  name: { en: "", ar: "" },
  description: { en: "", ar: "" },
  price: 0,
  image: "",
  available: true,
  tags: [],
  allergens: [],
  calories: 0,
  prepMinutes: 8,
  schedule: "all_day",
  modifierGroups: [],
});

export default function MenuAdmin() {
  const v = useVenue();
  const toast = useToast();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [catEdit, setCatEdit] = useState<Category | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const list = useMemo(
    () => v.items.filter((i) => (cat === "all" || i.categoryId === cat) && (!q || `${i.name.en} ${i.name.ar}`.toLowerCase().includes(q.toLowerCase()))),
    [v.items, cat, q],
  );

  return (
    <>
      <PageHeader
        title="Menu"
        sub={`${v.items.length} items in ${v.categories.length} categories · ${v.items.filter((i) => !i.available).length} sold out`}
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}><FileSpreadsheet className="size-4" /> Import CSV / Excel</Button>
            <Button onClick={() => setEditing(blankItem(cat === "all" ? v.categories[0].id : cat))}><Plus className="size-4" /> Add item</Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Categories */}
        <Card className="h-fit p-3">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Categories</p>
            <button onClick={() => setCatEdit({ id: uid("cat"), name: { en: "", ar: "" }, icon: "🍽️", active: true })} className="grid size-7 place-items-center rounded-lg text-brand-700 hover:bg-brand-50" title="Add category">
              <Plus className="size-4" />
            </button>
          </div>
          <button onClick={() => setCat("all")} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold", cat === "all" ? "bg-ink text-cream" : "hover:bg-sand")}>
            All items <span className="opacity-60">{v.items.length}</span>
          </button>
          {v.categories.map((c, i) => (
            <div key={c.id} className={cn("group flex items-center rounded-xl", cat === c.id ? "bg-ink text-cream" : "hover:bg-sand")}>
              <button onClick={() => setCat(c.id)} className={cn("flex flex-1 items-center gap-2 px-3 py-2 text-start text-sm font-semibold", !c.active && "opacity-50")}>
                <span>{c.icon}</span>
                <span className="truncate">{c.name.en}</span>
                <span className="ms-auto text-xs opacity-60">{v.items.filter((x) => x.categoryId === c.id).length}</span>
              </button>
              <div className="hidden pe-1 group-hover:flex">
                <button disabled={i === 0} onClick={() => v.moveCategory(c.id, -1)} className="grid size-6 place-items-center rounded disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                <button disabled={i === v.categories.length - 1} onClick={() => v.moveCategory(c.id, 1)} className="grid size-6 place-items-center rounded disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                <button onClick={() => setCatEdit(c)} className="grid size-6 place-items-center rounded"><Pencil className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </Card>

        {/* Items */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in English or Arabic" className="h-10 w-full rounded-xl border border-line ps-9 pe-3 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex rounded-xl border border-line p-1">
              <button onClick={() => setView("list")} className={cn("grid size-8 place-items-center rounded-lg", view === "list" && "bg-sand")} aria-label="List view"><List className="size-4" /></button>
              <button onClick={() => setView("grid")} className={cn("grid size-8 place-items-center rounded-lg", view === "grid" && "bg-sand")} aria-label="Grid view"><LayoutGrid className="size-4" /></button>
            </div>
          </div>

          {view === "list" ? (
            <div className="divide-y divide-line">
              {list.map((i) => (
                <div key={i.id} className="flex items-center gap-4 px-4 py-3 hover:bg-sand/30">
                  <ItemImage src={i.image} alt="" className={cn("size-14 rounded-xl", !i.available && "grayscale")} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{i.name.en} <span className="font-normal text-muted" dir="rtl">· {i.name.ar}</span></p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted">{v.categories.find((c) => c.id === i.categoryId)?.name.en}</span>
                      {i.modifierGroups.length > 0 && <Badge>{i.modifierGroups.length} option groups</Badge>}
                      {i.tags.map((t) => <Badge key={t} tone="brand">{tagLabel[t].en}</Badge>)}
                      {i.schedule !== "all_day" && <Badge tone="blue">{i.schedule === "breakfast" ? "Breakfast only" : "Evening only"}</Badge>}
                    </div>
                  </div>
                  <span className="w-24 text-end font-bold tabular-nums">{egp(i.price)}</span>
                  <div className="flex w-28 items-center justify-end gap-2">
                    <span className={cn("text-xs font-semibold", i.available ? "text-sage" : "text-red-600")}>{i.available ? "Available" : "Sold out"}</span>
                    <Toggle size="sm" checked={i.available} onChange={(x) => v.setItemAvailable(i.id, x)} />
                  </div>
                  <div className="flex">
                    <button onClick={() => setEditing(i)} className="grid size-9 place-items-center rounded-lg hover:bg-sand" title="Edit"><Pencil className="size-4" /></button>
                    <button onClick={() => { v.upsertItem({ ...i, id: uid("itm"), name: { en: `${i.name.en} (copy)`, ar: i.name.ar } }); toast.show("Item duplicated"); }} className="grid size-9 place-items-center rounded-lg hover:bg-sand" title="Duplicate"><Copy className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((i) => (
                <button key={i.id} onClick={() => setEditing(i)} className="overflow-hidden rounded-2xl border border-line text-start transition hover:shadow-md">
                  <div className="relative">
                    <ItemImage src={i.image} alt="" className={cn("h-36 w-full", !i.available && "grayscale")} />
                    {!i.available && <Badge tone="red" className="absolute top-2 start-2">Sold out</Badge>}
                  </div>
                  <div className="flex items-start justify-between gap-2 p-3">
                    <div>
                      <p className="font-semibold leading-snug">{i.name.en}</p>
                      <p className="text-xs text-muted" dir="rtl">{i.name.ar}</p>
                    </div>
                    <span className="font-bold">{egp(i.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!list.length && <p className="p-10 text-center text-muted">No items yet. Add one or import a CSV.</p>}
        </Card>
      </div>

      <ItemEditor
        item={editing}
        categories={v.categories}
        onClose={() => setEditing(null)}
        onSave={(i) => { v.upsertItem(i); setEditing(null); toast.show("Menu updated · live for customers"); }}
        onDelete={(id) => { v.deleteItem(id); setEditing(null); toast.show("Item deleted"); }}
      />
      <CategoryModal cat={catEdit} onClose={() => setCatEdit(null)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={(n) => toast.show(`Imported ${n} items`)} />
      {toast.node}
    </>
  );
}

/* ---------------- Item editor ---------------- */

function ItemEditor({ item, categories, onClose, onSave, onDelete }: {
  item: MenuItem | null; categories: Category[]; onClose: () => void; onSave: (i: MenuItem) => void; onDelete: (id: string) => void;
}) {
  return (
    <Drawer open={!!item} onClose={onClose} title={item?.name.en ? `Edit · ${item.name.en}` : "New menu item"}>
      {item && <EditorBody key={item.id} item={item} categories={categories} onSave={onSave} onDelete={onDelete} onClose={onClose} />}
    </Drawer>
  );
}

function EditorBody({ item, categories, onSave, onDelete, onClose }: {
  item: MenuItem; categories: Category[]; onSave: (i: MenuItem) => void; onDelete: (id: string) => void; onClose: () => void;
}) {
  const [d, setD] = useState<MenuItem>(item);
  const [tab, setTab] = useState<"details" | "options">("details");
  const fileRef = useRef<HTMLInputElement>(null);
  const exists = useVenue((s) => s.items.some((i) => i.id === item.id));
  const set = <K extends keyof MenuItem>(k: K, val: MenuItem[K]) => setD((x) => ({ ...x, [k]: val }));
  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set("image", String(r.result));
    r.readAsDataURL(f);
  };

  const setGroup = (gi: number, g: ModifierGroup) => set("modifierGroups", d.modifierGroups.map((x, i) => (i === gi ? g : x)));

  return (
    <div className="space-y-5 pb-4">
      <div className="flex rounded-xl bg-sand p-1">
        {(["details", "options"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-2 text-sm font-semibold", tab === t ? "bg-white shadow-sm" : "text-ink-soft")}>
            {t === "details" ? "Details" : `Options & modifiers (${d.modifierGroups.length})`}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <>
          <div className="flex gap-4">
            <button onClick={() => fileRef.current?.click()} className="group relative size-32 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-line">
              {d.image ? <ItemImage src={d.image} alt="" className="h-full w-full" /> : <span className="grid h-full place-items-center text-muted"><ImagePlus className="size-7" /></span>}
              <span className="absolute inset-0 grid place-items-center bg-ink/50 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"><Upload className="size-5" /></span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <div className="flex-1 space-y-3">
              <Field label="Image URL" hint="Upload a photo or paste a link. Images are auto-compressed & served via CDN.">
                <Input value={d.image.startsWith("data:") ? "(uploaded image)" : d.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name (English)"><Input value={d.name.en} onChange={(e) => set("name", { ...d.name, en: e.target.value })} /></Field>
            <Field label="الاسم (عربي)"><Input dir="rtl" value={d.name.ar} onChange={(e) => set("name", { ...d.name, ar: e.target.value })} /></Field>
          </div>
          <Field label="Description (English)"><Textarea rows={2} value={d.description.en} onChange={(e) => set("description", { ...d.description, en: e.target.value })} /></Field>
          <Field label="الوصف (عربي)"><Textarea dir="rtl" rows={2} value={d.description.ar} onChange={(e) => set("description", { ...d.description, ar: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (EGP)"><Input type="number" value={d.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
            <Field label="Prep time (min)"><Input type="number" value={d.prepMinutes} onChange={(e) => set("prepMinutes", Number(e.target.value))} /></Field>
            <Field label="Calories"><Input type="number" value={d.calories} onChange={(e) => set("calories", Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name.en}</option>)}
              </Select>
            </Field>
            <Field label="Availability schedule">
              <Select value={d.schedule} onChange={(e) => set("schedule", e.target.value as MenuItem["schedule"])}>
                <option value="all_day">All day</option>
                <option value="breakfast">Breakfast (8 AM – 1 PM)</option>
                <option value="evening">Evening (after 5 PM)</option>
              </Select>
            </Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Tags</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => set("tags", toggleIn(d.tags, t))} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", d.tags.includes(t) ? "border-brand bg-brand text-white" : "border-line")}>{tagLabel[t].en}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Allergens</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <button key={a} onClick={() => set("allergens", toggleIn(d.allergens, a))} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", d.allergens.includes(a) ? "border-ink bg-ink text-cream" : "border-line")}>{allergenLabel[a].en}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line p-3">
            <div><p className="text-sm font-semibold">Available for ordering</p><p className="text-xs text-muted">Turn off to show as “Sold out”.</p></div>
            <Toggle checked={d.available} onChange={(x) => set("available", x)} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">Sizes, milk types, extras, “remove” options. Customers see these when they tap the item.</p>
          {d.modifierGroups.map((g, gi) => (
            <div key={g.id} className="rounded-2xl border border-line p-4">
              <div className="flex gap-2">
                <Input value={g.name.en} onChange={(e) => setGroup(gi, { ...g, name: { ...g.name, en: e.target.value } })} placeholder="Group name" className="font-semibold" />
                <Input dir="rtl" value={g.name.ar} onChange={(e) => setGroup(gi, { ...g, name: { ...g.name, ar: e.target.value } })} placeholder="الاسم" />
                <button onClick={() => set("modifierGroups", d.modifierGroups.filter((_, i) => i !== gi))} className="grid size-10 shrink-0 place-items-center rounded-xl text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2"><Toggle size="sm" checked={g.min > 0} onChange={(x) => setGroup(gi, { ...g, min: x ? 1 : 0 })} /> Required</label>
                <label className="flex items-center gap-2">Max picks <Input type="number" min={1} value={g.max} onChange={(e) => setGroup(gi, { ...g, max: Math.max(1, Number(e.target.value)) })} className="w-16 py-1.5" /></label>
              </div>
              <div className="mt-3 space-y-2">
                {g.options.map((o, oi) => (
                  <div key={o.id} className="flex gap-2">
                    <Input value={o.name.en} onChange={(e) => setGroup(gi, { ...g, options: g.options.map((x, i) => (i === oi ? { ...x, name: { ...x.name, en: e.target.value } } : x)) })} placeholder="Option" />
                    <Input dir="rtl" value={o.name.ar} onChange={(e) => setGroup(gi, { ...g, options: g.options.map((x, i) => (i === oi ? { ...x, name: { ...x.name, ar: e.target.value } } : x)) })} placeholder="الخيار" />
                    <Input type="number" value={o.price} onChange={(e) => setGroup(gi, { ...g, options: g.options.map((x, i) => (i === oi ? { ...x, price: Number(e.target.value) } : x)) })} className="w-24" />
                    <button onClick={() => setGroup(gi, { ...g, options: g.options.filter((_, i) => i !== oi) })} className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-sand"><X className="size-4" /></button>
                  </div>
                ))}
                <button onClick={() => setGroup(gi, { ...g, options: [...g.options, { id: uid("opt"), name: { en: "", ar: "" }, price: 0 }] })} className="text-sm font-semibold text-brand-700">+ Add option</button>
              </div>
            </div>
          ))}
          <Button variant="soft" className="w-full" onClick={() => set("modifierGroups", [...d.modifierGroups, { id: uid("grp"), name: { en: "New group", ar: "" }, min: 0, max: 1, options: [] }])}>
            <Plus className="size-4" /> Add option group
          </Button>
        </div>
      )}

      <div className="sticky -bottom-5 -mx-6 flex gap-2 border-t border-line bg-white px-6 py-4">
        <Button onClick={() => onSave(d)} disabled={!d.name.en || d.price <= 0}>Save item</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {exists && <Button variant="ghost" className="ms-auto text-red-600" onClick={() => onDelete(d.id)}><Trash2 className="size-4" /> Delete</Button>}
      </div>
    </div>
  );
}

/* ---------------- Category modal ---------------- */

function CategoryModal({ cat, onClose }: { cat: Category | null; onClose: () => void }) {
  return (
    <Modal open={!!cat} onClose={onClose} title={cat?.name.en ? "Edit category" : "New category"}>
      {cat && <CategoryBody key={cat.id} cat={cat} onClose={onClose} />}
    </Modal>
  );
}

function CategoryBody({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const v = useVenue();
  const [c, setC] = useState(cat);
  const exists = v.categories.some((x) => x.id === cat.id);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <Field label="Icon"><Input value={c.icon} onChange={(e) => setC({ ...c, icon: e.target.value })} className="text-center text-xl" /></Field>
        <Field label="Name (English)"><Input value={c.name.en} onChange={(e) => setC({ ...c, name: { ...c.name, en: e.target.value } })} /></Field>
      </div>
      <Field label="الاسم (عربي)"><Input dir="rtl" value={c.name.ar} onChange={(e) => setC({ ...c, name: { ...c.name, ar: e.target.value } })} /></Field>
      <div className="flex items-center justify-between rounded-xl border border-line p-3">
        <span className="text-sm font-semibold">Visible on menu</span>
        <Toggle checked={c.active} onChange={(x) => setC({ ...c, active: x })} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => { v.upsertCategory(c); onClose(); }} disabled={!c.name.en}>Save</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {exists && <Button variant="ghost" className="ms-auto text-red-600" onClick={() => { if (confirm("Delete this category and its items?")) { v.deleteCategory(c.id); onClose(); } }}>Delete</Button>}
      </div>
    </div>
  );
}

/* ---------------- CSV import ---------------- */

const TEMPLATE = `category,name_en,name_ar,description_en,price,image_url
hot,Turkish Coffee,قهوة تركي,Finely ground coffee brewed in a cezve,65,https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800
desserts,Basbousa,بسبوسة,Semolina cake soaked in syrup with almonds,75,
fresh,Mango Juice,عصير مانجو,Fresh Egyptian mango,95,https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800`;

function parseCsv(text: string) {
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const cols = head.split(",").map((c) => c.trim());
  return rows.filter(Boolean).map((r) => {
    const cells = r.split(",");
    return Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? "").trim()]));
  });
}

function ImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (n: number) => void }) {
  const v = useVenue();
  const [text, setText] = useState(TEMPLATE);
  const rows = useMemo(() => { try { return parseCsv(text); } catch { return []; } }, [text]);
  const valid = rows.filter((r) => r.name_en && Number(r.price) > 0 && v.categories.some((c) => c.id === r.category));

  const importNow = () => {
    v.importItems(
      valid.map((r) => ({
        ...blankItem(r.category),
        name: { en: r.name_en, ar: r.name_ar || r.name_en },
        description: { en: r.description_en ?? "", ar: r.description_en ?? "" },
        price: Number(r.price),
        image: r.image_url ?? "",
      })),
    );
    onDone(valid.length);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Import menu from CSV / Excel" wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={importNow} disabled={!valid.length}>Import {valid.length} items</Button></>}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-sand">
          <Upload className="size-4" /> Upload .csv
          <input type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then(setText); }} />
        </label>
        <Button variant="ghost" size="sm" onClick={() => downloadText("menu-template.csv", TEMPLATE)}>Download template</Button>
        <span className="text-xs text-muted">Category ids: {v.categories.map((c) => c.id).join(", ")}</span>
      </div>
      <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mt-3 font-mono text-xs" />
      <p className="mt-4 mb-2 text-sm font-semibold">Preview</p>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-sand/60 text-xs text-muted"><tr>{["", "Category", "Name", "Arabic", "Price"].map((h) => <th key={h} className="px-3 py-2 text-start">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => {
              const ok = valid.includes(r);
              return (
                <tr key={i} className={cn(!ok && "bg-red-50/60")}>
                  <td className="px-3 py-2">{ok ? "✅" : "⚠️"}</td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2 font-semibold">{r.name_en}</td>
                  <td className="px-3 py-2" dir="rtl">{r.name_ar}</td>
                  <td className="px-3 py-2">{r.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
