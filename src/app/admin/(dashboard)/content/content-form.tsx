"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import type { WhyUsItem } from "@/types";

type ContentFormProps = {
  initial: {
    heroTitle: string;
    heroDescription: string;
    heroImage: string | null;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    whyUsItems: WhyUsItem[];
    ctaTitle: string;
    ctaDescription: string | null;
    ctaButtonText: string;
    aboutTitle: string | null;
    aboutContent: string | null;
  };
};

export function ContentForm({ initial }: ContentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initial,
    heroImage: initial.heroImage ?? "",
    ctaDescription: initial.ctaDescription ?? "",
    aboutTitle: initial.aboutTitle ?? "",
    aboutContent: initial.aboutContent ?? "",
    whyUsItems:
      initial.whyUsItems.length > 0
        ? initial.whyUsItems
        : [{ title: "", description: "", icon: "" }],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  async function uploadHero(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "content");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل الرفع");
      setForm((prev) => ({ ...prev, heroImage: json.data.url }));
      toast.success("تم رفع الصورة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        heroTitle: form.heroTitle,
        heroDescription: form.heroDescription,
        heroImage: form.heroImage || null,
        heroCtaPrimary: form.heroCtaPrimary,
        heroCtaSecondary: form.heroCtaSecondary,
        whyUsItems: form.whyUsItems.filter((i) => i.title && i.description),
        ctaTitle: form.ctaTitle,
        ctaDescription: form.ctaDescription || null,
        ctaButtonText: form.ctaButtonText,
        aboutTitle: form.aboutTitle || null,
        aboutContent: form.aboutContent || null,
      };
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل الحفظ");
      toast.success("تم حفظ المحتوى");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="card-surface space-y-4 p-5">
        <h3 className="font-bold">قسم البطل (Hero)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">العنوان</label>
            <input
              className={inputClass}
              required
              value={form.heroTitle}
              onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">الوصف</label>
            <textarea
              className={inputClass}
              rows={3}
              required
              value={form.heroDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, heroDescription: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">زر أساسي</label>
            <input
              className={inputClass}
              value={form.heroCtaPrimary}
              onChange={(e) =>
                setForm((p) => ({ ...p, heroCtaPrimary: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">زر ثانوي</label>
            <input
              className={inputClass}
              value={form.heroCtaSecondary}
              onChange={(e) =>
                setForm((p) => ({ ...p, heroCtaSecondary: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">صورة البطل</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                className={inputClass}
                dir="ltr"
                value={form.heroImage}
                onChange={(e) =>
                  setForm((p) => ({ ...p, heroImage: e.target.value }))
                }
              />
              <label className="btn-secondary cursor-pointer py-2.5 text-sm">
                <Upload className="h-4 w-4" />
                {uploading ? "جاري الرفع..." : "رفع"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => uploadHero(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">لماذا نحن</h3>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() =>
              setForm((p) => ({
                ...p,
                whyUsItems: [
                  ...p.whyUsItems,
                  { title: "", description: "", icon: "" },
                ],
              }))
            }
          >
            <Plus className="mr-1 inline h-4 w-4" />
            إضافة
          </button>
        </div>
        <div className="space-y-3">
          {form.whyUsItems.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                className={inputClass}
                placeholder="العنوان"
                value={item.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    whyUsItems: p.whyUsItems.map((row, i) =>
                      i === index ? { ...row, title: e.target.value } : row,
                    ),
                  }))
                }
              />
              <input
                className={inputClass}
                placeholder="الوصف"
                value={item.description}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    whyUsItems: p.whyUsItems.map((row, i) =>
                      i === index ? { ...row, description: e.target.value } : row,
                    ),
                  }))
                }
              />
              <button
                type="button"
                className="rounded-xl border border-border p-2.5 text-danger hover:bg-red-50"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    whyUsItems: p.whyUsItems.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface space-y-4 p-5">
        <h3 className="font-bold">قسم الدعوة للإجراء / من نحن</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">عنوان CTA</label>
            <input
              className={inputClass}
              required
              value={form.ctaTitle}
              onChange={(e) => setForm((p) => ({ ...p, ctaTitle: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">نص الزر</label>
            <input
              className={inputClass}
              value={form.ctaButtonText}
              onChange={(e) =>
                setForm((p) => ({ ...p, ctaButtonText: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">وصف CTA</label>
            <input
              className={inputClass}
              value={form.ctaDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, ctaDescription: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">عنوان من نحن</label>
            <input
              className={inputClass}
              value={form.aboutTitle}
              onChange={(e) =>
                setForm((p) => ({ ...p, aboutTitle: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">محتوى من نحن</label>
            <textarea
              className={inputClass}
              rows={4}
              value={form.aboutContent}
              onChange={(e) =>
                setForm((p) => ({ ...p, aboutContent: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        حفظ المحتوى
      </button>
    </form>
  );
}
