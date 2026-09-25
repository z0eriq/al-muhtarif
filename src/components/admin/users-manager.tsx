"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/constants";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string | Date;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  isActive: true,
};

export function UsersManager({
  users,
  canCreate,
  actorRole,
}: {
  users: UserRow[];
  canCreate: boolean;
  actorRole: Role;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const roleOptions = (Object.keys(ROLE_LABELS) as Role[]).filter((role) => {
    if (actorRole === "SUPER_ADMIN") return true;
    return role === "MANAGER" || role === "STAFF";
  });

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل الإنشاء");
      toast.success("تم إنشاء المستخدم");
      setOpen(false);
      setForm(emptyForm);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الإنشاء");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <>
      <DataTable
        columns={[
          { key: "name", header: "الاسم" },
          { key: "email", header: "البريد" },
          { key: "role", header: "الدور" },
          { key: "status", header: "الحالة" },
          { key: "date", header: "تاريخ الإنشاء" },
        ]}
        isEmpty={users.length === 0}
        emptyMessage="لا يوجد مستخدمون"
        toolbar={
          <>
            <h3 className="font-bold">مستخدمو لوحة التحكم</h3>
            {canCreate ? (
              <button
                type="button"
                className="btn-primary py-2.5 text-sm"
                onClick={() => setOpen(true)}
              >
                <Plus className="h-4 w-4" />
                مستخدم جديد
              </button>
            ) : null}
          </>
        }
      >
        {users.map((user) => (
          <DataTableRow key={user.id} className={pending ? "opacity-60" : undefined}>
            <DataTableCell className="font-semibold">{user.name}</DataTableCell>
            <DataTableCell dir="ltr">{user.email}</DataTableCell>
            <DataTableCell>
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                {ROLE_LABELS[user.role]}
              </span>
            </DataTableCell>
            <DataTableCell>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.isActive
                    ? "bg-emerald-50 text-success"
                    : "bg-red-50 text-danger"
                }`}
              >
                {user.isActive ? "نشط" : "معطّل"}
              </span>
            </DataTableCell>
            <DataTableCell className="text-muted">
              {format(new Date(user.createdAt), "dd/MM/yyyy")}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">مستخدم جديد</h3>
            <div className="space-y-3">
              <input
                className={inputClass}
                placeholder="الاسم"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className={inputClass}
                type="email"
                dir="ltr"
                placeholder="البريد الإلكتروني"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className={inputClass}
                type="password"
                dir="ltr"
                placeholder="كلمة المرور (8 أحرف على الأقل)"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value as Role }))
                }
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
                نشط
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="btn-primary py-2 text-sm disabled:opacity-70"
                disabled={saving || !form.name || !form.email || form.password.length < 8}
                onClick={save}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                إنشاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
