"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type SettingsFormProps = {
  initial: {
    storeNameAr: string;
    storeNameEn: string;
    logo: string;
    favicon: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    workingHours: string;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
    youtubeUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    googleMapsEmbed: string | null;
    googleMapsUrl: string | null;
    currency: "IQD" | "USD";
    currencySymbol: string;
    lowStockAlert: number;
  };
};

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initial,
    facebookUrl: initial.facebookUrl ?? "",
    instagramUrl: initial.instagramUrl ?? "",
    twitterUrl: initial.twitterUrl ?? "",
    youtubeUrl: initial.youtubeUrl ?? "",
    seoTitle: initial.seoTitle ?? "",
    seoDescription: initial.seoDescription ?? "",
    googleMapsEmbed: initial.googleMapsEmbed ?? "",
    googleMapsUrl: initial.googleMapsUrl ?? "",
  });
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          facebookUrl: form.facebookUrl || null,
          instagramUrl: form.instagramUrl || null,
          twitterUrl: form.twitterUrl || null,
          youtubeUrl: form.youtubeUrl || null,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          googleMapsEmbed: form.googleMapsEmbed || null,
          googleMapsUrl: form.googleMapsUrl || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const issueMsg = json.issues
          ? Object.values(json.issues as Record<string, string[]>).flat()[0]
          : null;
        throw new Error(issueMsg || json.error || "فشل الحفظ");
      }
      toast.success(json.message || "تم حفظ الإعدادات", { duration: 5000 });
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
        <h3 className="font-bold">معلومات المتجر</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المتجر (عربي)">
            <input className={inputClass} required value={form.storeNameAr} onChange={(e) => set("storeNameAr", e.target.value)} />
          </Field>
          <Field label="اسم المتجر (إنجليزي)">
            <input className={inputClass} required value={form.storeNameEn} onChange={(e) => set("storeNameEn", e.target.value)} />
          </Field>
          <Field label="البريد">
            <input className={inputClass} type="email" required dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="الهاتف">
            <input className={inputClass} required dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="واتساب">
            <input className={inputClass} required dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="ساعات العمل">
            <input className={inputClass} required value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="العنوان">
              <input className={inputClass} required value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      <section className="card-surface space-y-4 p-5">
        <h3 className="font-bold">وسائل التواصل</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="فيسبوك">
            <input className={inputClass} dir="ltr" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="إنستغرام">
            <input className={inputClass} dir="ltr" value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="تويتر / X">
            <input className={inputClass} dir="ltr" value={form.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://x.com/..." />
          </Field>
          <Field label="يوتيوب">
            <input className={inputClass} dir="ltr" value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." />
          </Field>
        </div>
      </section>

      <section className="card-surface space-y-4 p-5">
        <h3 className="font-bold">SEO والعملة</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="عنوان SEO">
            <input className={inputClass} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          </Field>
          <Field label="حد تنبيه المخزون">
            <input type="number" min={0} className={inputClass} value={form.lowStockAlert} onChange={(e) => set("lowStockAlert", Number(e.target.value))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="وصف SEO">
              <textarea className={inputClass} rows={3} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </Field>
          </div>
          <Field label="العملة">
            <select className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value as "IQD" | "USD")}>
              <option value="IQD">دينار عراقي (IQD)</option>
              <option value="USD">دولار (USD)</option>
            </select>
          </Field>
          <Field label="رمز العملة">
            <input className={inputClass} value={form.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} />
          </Field>
          <Field label="رابط الخريطة">
            <input className={inputClass} dir="ltr" value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="تضمين الخريطة (Embed)">
              <textarea className={inputClass} rows={3} dir="ltr" value={form.googleMapsEmbed} onChange={(e) => set("googleMapsEmbed", e.target.value)} placeholder="https://www.google.com/maps?q=...&output=embed" />
              <p className="mt-1 text-xs text-muted">يمكنك لصق رابط التضمين أو كود iframe كاملاً.</p>
            </Field>
          </div>
        </div>
      </section>

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        حفظ الإعدادات
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
