"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { createSlug } from "@/lib/utils";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

type CategoryRow = {
  id: string;
  nameAr: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  parent: { id: string; nameAr: string } | null;
  _count: { products: number; children: number };
};

type CategoriesManagerProps = {
  categories: CategoryRow[];
  canManage: boolean;
};

type FormState = {
  id?: string;
  nameAr: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  nameAr: "",
  slug: "",
  description: "",
  image: "",
  parentId: "",
  sortOrder: 0,
  isActive: true,
};

export function CategoriesManager({ categories, canManage }: CategoriesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const parentOptions = useMemo(
    () => categories.filter((c) => !form.id || c.id !== form.id),
    [categories, form.id],
  );

  function openCreate() {
    setForm(emptyForm);
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setForm({
      id: cat.id,
      nameAr: cat.nameAr,
      slug: cat.slug,
      description: cat.description ?? "",
      image: cat.image ?? "",
      parentId: cat.parentId ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setSlugTouched(true);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        nameAr: form.nameAr,
        slug: form.slug,
        description: form.description || null,
        image: form.image || null,
        parentId: form.parentId || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      const res = await fetch(
        form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories",
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

  async function toggleActive(cat: CategoryRow) {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل التحديث");
      return;
    }
    toast.success(cat.isActive ? "تم التعطيل" : "تم التفعيل");
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("حذف التصنيف؟")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
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
          { key: "name", header: "التصنيف" },
          { key: "parent", header: "الأب" },
          { key: "sort", header: "الترتيب" },
          { key: "products", header: "المنتجات" },
          { key: "status", header: "الحالة" },
          { key: "actions", header: "إجراءات" },
        ]}
        isEmpty={categories.length === 0}
        emptyMessage="لا توجد تصنيفات"
        toolbar={
          <>
            <h3 className="font-bold">قائمة التصنيفات</h3>
            {canManage ? (
              <button type="button" className="btn-primary py-2.5 text-sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                تصنيف جديد
              </button>
            ) : null}
          </>
        }
      >
        {categories.map((cat) => (
          <DataTableRow key={cat.id} className={pending ? "opacity-60" : undefined}>
            <DataTableCell>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image || "/logo.png"}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold">{cat.nameAr}</p>
                  <p className="text-xs text-muted" dir="ltr">
                    {cat.slug}
                  </p>
                </div>
              </div>
            </DataTableCell>
            <DataTableCell>{cat.parent?.nameAr || "—"}</DataTableCell>
            <DataTableCell>{cat.sortOrder}</DataTableCell>
            <DataTableCell>{cat._count.products}</DataTableCell>
            <DataTableCell>
              <button
                type="button"
                disabled={!canManage}
                onClick={() => toggleActive(cat)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  cat.isActive
                    ? "bg-emerald-50 text-success"
                    : "bg-red-50 text-danger"
                }`}
              >
                {cat.isActive ? "نشط" : "معطّل"}
              </button>
            </DataTableCell>
            <DataTableCell>
              {canManage ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-danger"
                    onClick={() => remove(cat.id)}
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
              {form.id ? "تعديل تصنيف" : "تصنيف جديد"}
            </h3>
            <div className="space-y-3">
              <input
                className={inputClass}
                placeholder="الاسم بالعربية"
                value={form.nameAr}
                onChange={(e) => {
                  const nameAr = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    nameAr,
                    slug: slugTouched ? prev.slug : createSlug(nameAr),
                  }));
                }}
              />
              <input
                className={inputClass}
                placeholder="الرابط المختصر"
                dir="ltr"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
              />
              <textarea
                className={inputClass}
                placeholder="الوصف"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <select
                className={inputClass}
                value={form.parentId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, parentId: e.target.value }))
                }
              >
                <option value="">بدون أب (رئيسي)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="الترتيب"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
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
              <input
                className={inputClass}
                placeholder="رابط الصورة"
                dir="ltr"
                value={form.image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image: e.target.value }))
                }
              />
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
                disabled={saving || !form.nameAr || !form.slug}
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
