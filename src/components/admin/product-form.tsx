"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { createSlug } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";

type CategoryOption = { id: string; nameAr: string };
type ImageItem = { url: string; alt?: string | null; sortOrder: number };
type SpecRow = { key: string; value: string };

export type ProductFormValues = {
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  sku?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  status: "ACTIVE" | "DRAFT" | "DISABLED";
  isFeatured: boolean;
  isNew: boolean;
  installmentAvailable: boolean;
  installmentUrl: string | null;
  tags: string[];
  categoryIds: string[];
  images: ImageItem[];
  specifications?: Record<string, string> | null;
};

type ProductFormProps = {
  categories: CategoryOption[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
  mode: "create" | "edit";
};

const emptyDefaults: ProductFormValues = {
  nameAr: "",
  nameEn: "",
  slug: "",
  sku: "",
  descriptionAr: "",
  descriptionEn: "",
  price: 0,
  compareAtPrice: null,
  stock: 0,
  lowStockThreshold: 5,
  status: "ACTIVE",
  isFeatured: false,
  isNew: false,
  installmentAvailable: false,
  installmentUrl: "",
  tags: [],
  categoryIds: [],
  images: [],
  specifications: {},
};

export function ProductForm({
  categories,
  initial,
  productId,
  mode,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>({
    ...emptyDefaults,
    ...initial,
    tags: initial?.tags ?? [],
    categoryIds: initial?.categoryIds ?? [],
    images: initial?.images ?? [],
    specifications: initial?.specifications ?? {},
    installmentAvailable: initial?.installmentAvailable ?? false,
    installmentUrl: initial?.installmentUrl ?? "",
  });
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [specs, setSpecs] = useState<SpecRow[]>(() => {
    const entries = Object.entries(initial?.specifications ?? {});
    return entries.length > 0
      ? entries.map(([key, value]) => ({ key, value }))
      : [{ key: "", value: "" }];
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const statusOptions = useMemo(
    () => Object.entries(PRODUCT_STATUS_LABELS) as Array<[keyof typeof PRODUCT_STATUS_LABELS, string]>,
    [],
  );

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "products");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "فشل الرفع");
        }
        uploaded.push({
          url: json.data.url,
          alt: form.nameAr || file.name,
          sortOrder: form.images.length + uploaded.length,
        });
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success("تم رفع الصور");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل رفع الصور");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const specifications = Object.fromEntries(
      specs
        .filter((row) => row.key.trim() && row.value.trim())
        .map((row) => [row.key.trim(), row.value.trim()]),
    );

    const payload: ProductFormValues = {
      ...form,
      nameEn: form.nameEn || null,
      sku: form.sku || null,
      descriptionAr: form.descriptionAr || null,
      descriptionEn: form.descriptionEn || null,
      compareAtPrice: form.compareAtPrice || null,
      installmentUrl: form.installmentAvailable
        ? form.installmentUrl || null
        : form.installmentUrl || null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      specifications,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        const issueMsg = json.issues
          ? Object.values(json.issues as Record<string, string[]>).flat()[0]
          : null;
        throw new Error(issueMsg || json.error || "فشل الحفظ");
      }
      toast.success(mode === "create" ? "تم إنشاء المنتج" : "تم تحديث المنتج");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">المعلومات الأساسية</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">اسم المنتج (عربي) *</label>
                <input
                  className={inputClass}
                  required
                  value={form.nameAr}
                  onChange={(e) => {
                    update("nameAr", e.target.value);
                    if (!slugTouched) update("slug", createSlug(e.target.value));
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">الرابط المختصر *</label>
                <input
                  className={inputClass}
                  required
                  dir="ltr"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value);
                  }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">SKU</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={form.sku ?? ""}
                  onChange={(e) => update("sku", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">الوصف</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={form.descriptionAr ?? ""}
                  onChange={(e) => update("descriptionAr", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">التسعير والمخزون</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">السعر *</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  required
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">السعر قبل الخصم</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={inputClass}
                  value={form.compareAtPrice ?? ""}
                  onChange={(e) =>
                    update(
                      "compareAtPrice",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">المخزون *</label>
                <input
                  type="number"
                  min={0}
                  required
                  className={inputClass}
                  value={form.stock}
                  onChange={(e) => update("stock", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">حد التنبيه</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    update("lowStockThreshold", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          <section className="card-surface space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">المواصفات</h3>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
              >
                + إضافة حقل
              </button>
            </div>
            <div className="space-y-3">
              {specs.map((row, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    className={inputClass}
                    placeholder="المفتاح (مثل: الشاشة)"
                    value={row.key}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, key: e.target.value } : r,
                        ),
                      )
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="القيمة"
                    value={row.value}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, value: e.target.value } : r,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-border p-2.5 text-danger hover:bg-red-50"
                    onClick={() =>
                      setSpecs((prev) => prev.filter((_, i) => i !== index))
                    }
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">النشر</h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium">الحالة</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as ProductFormValues["status"])
                }
              >
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update("isFeatured", e.target.checked)}
              />
              منتج مميز
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => update("isNew", e.target.checked)}
              />
              منتج جديد
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.installmentAvailable}
                onChange={(e) => update("installmentAvailable", e.target.checked)}
              />
              إمكانية التقسيط
            </label>
            {form.installmentAvailable ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  رابط التقسيط *
                </label>
                <input
                  className={inputClass}
                  dir="ltr"
                  required
                  type="url"
                  placeholder="https://..."
                  value={form.installmentUrl ?? ""}
                  onChange={(e) => update("installmentUrl", e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  سيظهر زر التقسيط للعميل ويفتح هذا الرابط.
                </p>
              </div>
            ) : null}
          </section>

          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">التصنيفات *</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      update(
                        "categoryIds",
                        e.target.checked
                          ? [...form.categoryIds, cat.id]
                          : form.categoryIds.filter((id) => id !== cat.id),
                      );
                    }}
                  />
                  {cat.nameAr}
                </label>
              ))}
            </div>
          </section>

          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">الوسوم</h3>
            <input
              className={inputClass}
              placeholder="افصل بفاصلة"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </section>

          <section className="card-surface space-y-4 p-5">
            <h3 className="font-bold">الصور</h3>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-light/40 px-4 py-6 text-sm text-primary hover:bg-primary-light">
              <Upload className="h-5 w-5" />
              {uploading ? "جاري الرفع..." : "رفع صور"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {form.images.map((img, index) => (
                <div key={`${img.url}-${index}`} className="relative overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 left-1 rounded-full bg-black/60 p-1 text-white"
                    onClick={() =>
                      update(
                        "images",
                        form.images.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {mode === "create" ? "إنشاء المنتج" : "حفظ التعديلات"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.push("/admin/products")}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
