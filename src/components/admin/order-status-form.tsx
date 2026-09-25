"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل التحديث");
      toast.success("تم تحديث حالة الطلب");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحديث");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-surface flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium">حالة الطلب</label>
        <select
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((key) => (
            <option key={key} value={key}>
              {ORDER_STATUS_LABELS[key]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="btn-primary disabled:opacity-70"
        disabled={saving || pending || status === currentStatus}
        onClick={save}
      >
        تحديث الحالة
      </button>
    </div>
  );
}
