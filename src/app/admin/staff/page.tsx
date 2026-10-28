"use client";

import { useState } from "react";
import { Check, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useVenue } from "@/lib/store";
import type { Role, StaffUser } from "@/lib/types";
import { ago, cn, useNow } from "@/lib/utils";
import { Badge, Button, Card, Field, Input, Modal, Select, Toggle } from "@/components/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { ROLE_LABEL } from "@/components/staff/StaffShell";

const ROLES: Role[] = ["owner", "manager", "cashier", "waiter", "kitchen"];
const PERMS: { label: string; roles: Role[] }[] = [
  { label: "See live orders", roles: ["owner", "manager", "cashier", "waiter", "kitchen"] },
  { label: "Update order status", roles: ["owner", "manager", "cashier", "waiter", "kitchen"] },
  { label: "Mark orders paid", roles: ["owner", "manager", "cashier"] },
  { label: "Cancel / edit orders", roles: ["owner", "manager", "cashier"] },
  { label: "Toggle sold-out items", roles: ["owner", "manager", "kitchen"] },
  { label: "Edit menu & prices", roles: ["owner", "manager"] },
  { label: "Manage tables & QR codes", roles: ["owner", "manager"] },
  { label: "View sales reports", roles: ["owner", "manager"] },
  { label: "Manage staff", roles: ["owner"] },
  { label: "Billing & payment settings", roles: ["owner"] },
];
const COLORS = ["#8f4e18", "#4f7a5a", "#3d5a80", "#9a4c7e", "#b5651d", "#2a1c14"];

export default function StaffAdmin() {
  const v = useVenue();
  const now = useNow(60_000);
  const [edit, setEdit] = useState<StaffUser | null>(null);

  return (
    <>
      <PageHeader
        title="Staff & roles"
        sub={`${v.staff.filter((u) => u.active).length} active team members`}
        actions={<Button onClick={() => setEdit({ id: `u_${Date.now()}`, name: "", email: "", role: "waiter", active: true, lastActive: Date.now(), color: COLORS[v.staff.length % COLORS.length] })}><Plus className="size-4" /> Invite staff</Button>}
      />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand/50 text-xs uppercase tracking-wider text-muted">
            <tr>{["Member", "Role", "Last active", "Status", ""].map((h) => <th key={h} className="px-5 py-3 text-start font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {v.staff.map((u) => (
              <tr key={u.id} className={cn(!u.active && "opacity-55")}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full font-bold text-white" style={{ background: u.color }}>{u.name.split(" ").map((p) => p[0]).join("")}</span>
                    <div><p className="font-semibold">{u.name}</p><p className="text-xs text-muted">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3"><Badge tone={u.role === "owner" ? "dark" : u.role === "manager" ? "brand" : "neutral"}>{ROLE_LABEL[u.role]}</Badge></td>
                <td className="px-5 py-3 text-muted">{ago(u.lastActive, now)}</td>
                <td className="px-5 py-3"><Toggle size="sm" checked={u.active} onChange={(x) => v.upsertStaff({ ...u, active: x })} /></td>
                <td className="px-5 py-3 text-end">
                  <button onClick={() => setEdit(u)} className="grid size-8 place-items-center rounded-lg hover:bg-sand"><Pencil className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="p-5">
          <p className="font-bold">Permissions by role</p>
          <p className="text-sm text-muted">Role-based access control: each staff login only sees what they need.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand/50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">Permission</th>
                {ROLES.map((r) => <th key={r} className="px-3 py-3 text-center font-semibold">{ROLE_LABEL[r].split(" ")[0]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PERMS.map((p) => (
                <tr key={p.label}>
                  <td className="px-5 py-3 font-medium">{p.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-3 text-center">
                      {p.roles.includes(r) ? <Check className="mx-auto size-4 text-sage" strokeWidth={3} /> : <Minus className="mx-auto size-4 text-line" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.name ? "Edit staff member" : "Invite staff member"}>
        {edit && <StaffForm key={edit.id} user={edit} onClose={() => setEdit(null)} />}
      </Modal>
    </>
  );
}

function StaffForm({ user, onClose }: { user: StaffUser; onClose: () => void }) {
  const v = useVenue();
  const [u, setU] = useState(user);
  const exists = v.staff.some((x) => x.id === user.id);
  return (
    <div className="space-y-3">
      <Field label="Full name"><Input value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} /></Field>
      <Field label="Email" hint={exists ? undefined : "They'll get an invite link to set a PIN."}><Input type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></Field>
      <Field label="Role">
        <Select value={u.role} onChange={(e) => setU({ ...u, role: e.target.value as Role })}>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </Select>
      </Field>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => { v.upsertStaff(u); onClose(); }} disabled={!u.name || !u.email}>{exists ? "Save" : "Send invite"}</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {exists && u.role !== "owner" && <Button variant="ghost" className="ms-auto text-red-600" onClick={() => { v.deleteStaff(u.id); onClose(); }}><Trash2 className="size-4" /> Remove</Button>}
      </div>
    </div>
  );
}
