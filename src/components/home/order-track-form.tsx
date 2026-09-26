"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PackageSearch } from "lucide-react";
import { normalizeOrderNumber } from "@/lib/order-stock";

type OrderTrackFormProps = {
  compact?: boolean;
};

export function OrderTrackForm({ compact = false }: OrderTrackFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const number = normalizeOrderNumber(value);
    if (!number) {
      toast.error("أدخل رقم الطلب");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?number=${encodeURIComponent(number)}`);
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { orderNumber?: string };
      };
      if (!res.ok || !json.success || !json.data?.orderNumber) {
        toast.error(json.error || "لم نجد طلباً بهذا الرقم");
        return;
      }
      router.push(`/order/${json.data.orderNumber}`);
    } catch {
      toast.error("تعذر تتبع الطلب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "flex w-full max-w-md flex-col gap-2 sm:flex-row"
          : "flex flex-col gap-3 sm:flex-row"
      }
    >
      <label className="sr-only" htmlFor="order-number">
        رقم الطلب
      </label>
      <input
        id="order-number"
        name="orderNumber"
        dir="ltr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="AM-XXXXXXXX"
        className="h-12 flex-1 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary h-12 shrink-0 disabled:opacity-70"
      >
        <PackageSearch className="h-4 w-4" />
        {loading ? "جاري البحث..." : "تتبع الطلب"}
      </button>
    </form>
  );
}
