"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
};

type FormState = {
  id?: string;
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrder: string;
  maxUses: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 10,
  minOrder: "",
  maxUses: "",
  isActive: true,
};

export function CouponsManager({
  coupons,
  canManage,
}: {
  coupons: CouponRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(coupon: CouponRow) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? "",
      discountType: coupon.discountType === "FIXED" ? "FIXED" : "PERCENT",
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder != null ? String(coupon.minOrder) : "",
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
      isActive: coupon.isActive,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        description: form.description || null,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrder: form.minOrder ? Number(form.minOrder) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        isActive: form.isActive,
      };
      const res = await fetch(
        form.id ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل الحفظ");
      toast.success(form.id ? "تم التحديث" : "تم الإنشاء");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("حذف القسيمة؟")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل الحذف");
      return;
    }
    toast.success("تم الحذف");
    startTransition(() => router.refresh());
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <>
      <DataTable
        columns={[
          { key: "code", header: "الرمز" },
          { key: "discount", header: "الخصم" },
          { key: "uses", header: "الاستخدام" },
          { key: "status", header: "الحالة" },
          { key: "actions", header: "إجراءات" },
        ]}
        isEmpty={coupons.length === 0}
        emptyMessage="لا توجد قسائم"
        toolbar={
          <>
            <h3 className="font-bold">قسائم الخصم</h3>
            {canManage ? (
              <button type="button" className="btn-primary py-2.5 text-sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                قسيمة جديدة
              </button>
            ) : null}
          </>
        }
      >
        {coupons.map((coupon) => (
          <DataTableRow key={coupon.id} className={pending ? "opacity-60" : undefined}>
            <DataTableCell>
              <p className="font-mono font-semibold" dir="ltr">
                {coupon.code}
              </p>
              {coupon.description ? (
                <p className="text-xs text-muted">{coupon.description}</p>
              ) : null}
            </DataTableCell>
            <DataTableCell>
              {coupon.discountType === "PERCENT"
                ? `${coupon.discountValue}%`
                : formatPrice(coupon.discountValue)}
            </DataTableCell>
            <DataTableCell>
              {coupon.usedCount}
              {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
            </DataTableCell>
            <DataTableCell>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  coupon.isActive
                    ? "bg-emerald-50 text-success"
                    : "bg-red-50 text-danger"
                }`}
              >
                {coupon.isActive ? "نشط" : "معطّل"}
              </span>
            </DataTableCell>
            <DataTableCell>
              {canManage ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary"
                    onClick={() => openEdit(coupon)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-danger"
                    onClick={() => remove(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold">
              {form.id ? "تعديل قسيمة" : "قسيمة جديدة"}
            </h3>
            <div className="space-y-3">
              <input
                className={inputClass}
                placeholder="الرمز"
                dir="ltr"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
              />
              <input
                className={inputClass}
                placeholder="الوصف"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={inputClass}
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountType: e.target.value as "PERCENT" | "FIXED",
                    }))
                  }
                >
                  <option value="PERCENT">نسبة %</option>
                  <option value="FIXED">مبلغ ثابت</option>
                </select>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="قيمة الخصم"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountValue: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="حد أدنى للطلب"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minOrder: e.target.value }))
                  }
                />
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  placeholder="أقصى استخدام"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxUses: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                نشط
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary py-2 text-sm" onClick={() => setOpen(false)}>
                إلغاء
              </button>
              <button
                type="button"
                className="btn-primary py-2 text-sm disabled:opacity-70"
                disabled={saving || !form.code}
                onClick={save}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                حفظ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
