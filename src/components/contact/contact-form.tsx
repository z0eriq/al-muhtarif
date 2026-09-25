"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackMetaEvent } from "@/components/analytics/track-meta";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          eventSourceUrl: window.location.href,
        }),
      });
      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        message?: string;
        eventId?: string;
      };

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "تعذر إرسال الرسالة");
        return;
      }

      toast.success(data.message ?? "تم إرسال رسالتك بنجاح");
      if (data.eventId) {
        trackMetaEvent("Lead", undefined, { eventId: data.eventId, sendToCapi: false });
      }
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold">الاسم *</label>
        <Input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          placeholder="اسمك"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">الهاتف *</label>
        <Input
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
          placeholder="07xxxxxxxxx"
          dir="ltr"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">البريد</label>
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="email@example.com"
          dir="ltr"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">الرسالة *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          required
          rows={5}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="كيف يمكننا مساعدتك؟"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
      </Button>
    </form>
  );
}
