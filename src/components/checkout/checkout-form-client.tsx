"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { IRAQ_GOVERNORATES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { trackMetaEvent } from "@/components/analytics/track-meta";

type CheckoutFormClientProps = {
  currencySymbol?: string;
};

export function CheckoutFormClient({
  currencySymbol = "د.ع",
}: CheckoutFormClientProps) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    governorate: "بابل",
    district: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (items.length === 0) return;
    trackMetaEvent("InitiateCheckout", {
      currency: "IQD",
      value: subtotal,
      content_type: "product",
      content_ids: items.map((item) => item.productId),
      contents: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    });
    // Track once when checkout opens with the current cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="لا يمكن إتمام الطلب"
        description="سلتك فارغة. أضف منتجات أولاً."
        action={
          <Link href="/shop" className="btn-primary">
            العودة للمتجر
          </Link>
        }
      />
    );
  }

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerEmail: form.customerEmail || null,
          notes: form.notes || null,
          paymentMethod: "COD",
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        issues?: Record<string, string[]>;
        data?: { orderNumber: string };
        message?: string;
      };

      if (!res.ok || !data.success) {
        if (data.issues) setErrors(data.issues);
        toast.error(data.error ?? "تعذر إنشاء الطلب");
        return;
      }

      clear();
      toast.success("تم استلام طلبك بنجاح");
      router.push(`/order/${data.data!.orderNumber}`);
    } catch {
      toast.error("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_340px]"
    >
      <div className="space-y-5 rounded-2xl border border-border bg-white p-5 md:p-6">
        <h2 className="text-lg font-bold">بيانات التوصيل</h2>
        <p className="text-sm text-muted">
          الدفع عند الاستلام (COD) — سنتواصل معك لتأكيد الطلب.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              الاسم الكامل *
            </label>
            <Input
              name="customerName"
              value={form.customerName}
              onChange={onChange}
              required
              placeholder="اسمك الثلاثي"
            />
            {fieldError("customerName") ? (
              <p className="mt-1 text-xs text-danger">
                {fieldError("customerName")}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              رقم الهاتف *
            </label>
            <Input
              name="customerPhone"
              value={form.customerPhone}
              onChange={onChange}
              required
              placeholder="07xxxxxxxxx"
              dir="ltr"
            />
            {fieldError("customerPhone") ? (
              <p className="mt-1 text-xs text-danger">
                {fieldError("customerPhone")}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              البريد (اختياري)
            </label>
            <Input
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={onChange}
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              المحافظة *
            </label>
            <select
              name="governorate"
              value={form.governorate}
              onChange={onChange}
              required
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {IRAQ_GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              المنطقة / القضاء *
            </label>
            <Input
              name="district"
              value={form.district}
              onChange={onChange}
              required
              placeholder="مثال: الحلة"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              العنوان التفصيلي *
            </label>
            <Input
              name="address"
              value={form.address}
              onChange={onChange}
              required
              placeholder="الشارع، أقرب نقطة دالة..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              ملاحظات
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={3}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="أي تفاصيل إضافية للتوصيل..."
            />
          </div>
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">ملخص الطلب</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3 text-sm">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-soft">
                <Image
                  src={item.image || "/logo.png"}
                  alt={item.nameAr}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-semibold">{item.nameAr}</span>
                <span className="mt-1 block text-muted">
                  {item.quantity} × {formatPrice(item.price, { currencySymbol })}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">الإجمالي</span>
          <span className="text-lg font-extrabold text-primary">
            {formatPrice(subtotal, { currencySymbol })}
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جاري إرسال الطلب..." : "تأكيد الطلب · دفع عند الاستلام"}
        </Button>
      </aside>
    </form>
  );
}
