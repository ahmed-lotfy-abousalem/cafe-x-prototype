"use client";

import { useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, Pencil, Plus, Printer, RefreshCw, Trash2, Users } from "lucide-react";
import { useVenue } from "@/lib/store";
import type { Table } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, Field, Input, Logo, Modal, Select, Toggle, useToast } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";

const ZONES: Table["zone"][] = ["Indoor", "Window", "Terrace", "Counter"];
const qrUrl = (token?: string) => `${window.location.origin}/l/cafe-x${token ? `?t=${token}` : ""}`;

export default function TablesPage() {
  const v = useVenue();
  const toast = useToast();
  const [zone, setZone] = useState<string>("all");
  const [edit, setEdit] = useState<Table | null>(null);
  const list = v.tables.filter((t) => zone === "all" || t.zone === zone);
  const busy = (label: string) => v.orders.some((o) => o.tableLabel === label && ["received", "preparing", "ready"].includes(o.status));

  const downloadPng = (id: string, name: string) => {
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `cafex-${name}.png`;
    a.click();
  };

  return (
    <>
      <PageHeader
        title="Tables & QR codes"
        sub={`${v.tables.filter((t) => t.active).length} active tables · ${v.tables.reduce((a, t) => a + t.seats, 0)} seats · each QR opens the link tree with the table pre-selected`}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print all (table tents)</Button>
            <Button onClick={() => setEdit({ id: `t_${Date.now()}`, label: String(v.tables.length + 1), token: `tbl_${Math.random().toString(36).slice(2, 9)}`, zone: "Indoor", seats: 4, active: true })}>
              <Plus className="size-4" /> Add table
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...ZONES].map((z) => (
          <button key={z} onClick={() => setZone(z)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold", zone === z ? "bg-ink text-cream" : "bg-white text-ink-soft shadow-card")}>
            {z === "all" ? "All zones" : z} <span className="opacity-60">{z === "all" ? v.tables.length : v.tables.filter((t) => t.zone === z).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* General QR */}
        <Card className="flex flex-col items-center border-brand/30 bg-brand-50/50 p-5 text-center">
          <Badge tone="brand">General QR</Badge>
          <div className="mt-3 rounded-2xl bg-white p-3 shadow-card">
            <QRCodeSVG value={qrUrl()} size={132} fgColor="#2a1c14" level="M" />
            <QRCodeCanvas id="qr-general" value={qrUrl()} size={1024} marginSize={4} fgColor="#2a1c14" level="M" className="hidden" />
          </div>
          <p className="mt-3 font-bold">Counter · Window · Flyers</p>
          <p className="text-xs text-muted">No table attached: guest picks a table or takeaway.</p>
          <div className="mt-3 flex gap-1">
            <Button size="sm" variant="outline" onClick={() => downloadPng("general", "general")}><Download className="size-4" /> PNG</Button>
            <Button size="sm" variant="ghost" onClick={() => window.open(qrUrl(), "_blank")}><ExternalLink className="size-4" /></Button>
          </div>
        </Card>

        {list.map((t) => {
          const occupied = busy(t.label);
          return (
            <Card key={t.id} className={cn("flex flex-col p-5", !t.active && "opacity-60")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-extrabold">Table {t.label}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted"><Users className="size-3.5" /> {t.seats} seats · {t.zone}</p>
                </div>
                {t.active ? <Badge tone={occupied ? "amber" : "green"}>{occupied ? "Ordering" : "Free"}</Badge> : <Badge>Disabled</Badge>}
              </div>
              <div className="mx-auto mt-3 rounded-2xl border border-line bg-white p-3">
                <QRCodeSVG value={qrUrl(t.token)} size={132} fgColor="#2a1c14" level="M" />
                <QRCodeCanvas id={`qr-${t.id}`} value={qrUrl(t.token)} size={1024} marginSize={4} fgColor="#2a1c14" level="M" className="hidden" />
              </div>
              <p className="mt-2 truncate text-center font-mono text-[11px] text-muted">{t.token}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <div className="flex">
                  <IconBtn title="Download PNG" onClick={() => downloadPng(t.id, `table-${t.label}`)}><Download className="size-4" /></IconBtn>
                  <IconBtn title="Copy link" onClick={() => { navigator.clipboard?.writeText(qrUrl(t.token)); toast.show("Link copied"); }}><Copy className="size-4" /></IconBtn>
                  <IconBtn title="Open as guest" onClick={() => window.open(qrUrl(t.token), "_blank")}><ExternalLink className="size-4" /></IconBtn>
                  <IconBtn title="Rotate token (invalidates old printed QR)" onClick={() => { v.rotateToken(t.id); toast.show(`New QR generated for table ${t.label}`); }}><RefreshCw className="size-4" /></IconBtn>
                  <IconBtn title="Edit" onClick={() => setEdit(t)}><Pencil className="size-4" /></IconBtn>
                </div>
                <Toggle size="sm" checked={t.active} onChange={(x) => v.upsertTable({ ...t, active: x })} label="Active" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Printable table tents */}
      <div className="print-only print-area bg-white">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8mm" }}>
          {v.tables.filter((t) => t.active).map((t) => (
            <div key={t.id} style={{ border: "1px dashed #ccc", padding: "8mm", textAlign: "center", breakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Logo size={40} /></div>
              <p style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>Scan to order</p>
              <p style={{ fontSize: 14 }}>امسح الكود للطلب</p>
              <div style={{ display: "flex", justifyContent: "center", margin: "6mm 0" }}><QRCodeSVG value={qrUrl(t.token)} size={170} fgColor="#2a1c14" /></div>
              <p style={{ fontSize: 28, fontWeight: 800 }}>Table {t.label}</p>
              <p style={{ fontSize: 11, color: "#777" }}>Menu · Order · Pay · Call waiter</p>
            </div>
          ))}
        </div>
      </div>

      <TableModal table={edit} onClose={() => setEdit(null)} />
      {toast.node}
    </>
  );
}

function IconBtn(p: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-sand hover:text-ink" />;
}

function TableModal({ table, onClose }: { table: Table | null; onClose: () => void }) {
  return (
    <Modal open={!!table} onClose={onClose} title="Table">
      {table && <TableBody key={table.id} table={table} onClose={onClose} />}
    </Modal>
  );
}

function TableBody({ table, onClose }: { table: Table; onClose: () => void }) {
  const v = useVenue();
  const [t, setT] = useState(table);
  const exists = v.tables.some((x) => x.id === table.id);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Label"><Input value={t.label} onChange={(e) => setT({ ...t, label: e.target.value })} /></Field>
        <Field label="Seats"><Input type="number" value={t.seats} onChange={(e) => setT({ ...t, seats: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Zone">
        <Select value={t.zone} onChange={(e) => setT({ ...t, zone: e.target.value as Table["zone"] })}>
          {ZONES.map((z) => <option key={z}>{z}</option>)}
        </Select>
      </Field>
      <Field label="QR token" hint="Opaque & rotatable, so guests can't guess other tables' links."><Input value={t.token} readOnly className="font-mono text-xs" /></Field>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => { v.upsertTable(t); onClose(); }} disabled={!t.label}>Save</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {exists && <Button variant="ghost" className="ms-auto text-red-600" onClick={() => { v.deleteTable(t.id); onClose(); }}><Trash2 className="size-4" /> Delete</Button>}
      </div>
    </div>
  );
}
