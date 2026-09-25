import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  orderInquiryMessage,
} from "@/lib/whatsapp";
import { getSettings } from "@/services/settings.service";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { PurchaseTracker } from "@/components/analytics/purchase-tracker";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params;
  return { title: `طلب ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    }),
    getSettings(),
  ]);

  if (!order) notFound();

  const waUrl = buildWhatsAppUrl(
    settings.whatsapp,
    orderInquiryMessage(order.orderNumber),
  );

  return (
    <div className="container-store py-10 md:py-14">
      <PurchaseTracker
        orderNumber={order.orderNumber}
        value={Number(order.total)}
        items={order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
        }))}
      />
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-6 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold md:text-3xl">
          تم استلام طلبك بنجاح
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          شكراً لك. سنتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل.
        </p>

        <div className="mt-6 rounded-xl bg-primary-soft/60 px-4 py-4">
          <p className="text-sm text-muted">رقم الطلب</p>
          <p className="mt-1 text-2xl font-extrabold tracking-wide text-primary" dir="ltr">
            {order.orderNumber}
          </p>
          <p className="mt-2 text-sm">
            الحالة:{" "}
            <span className="font-semibold">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </p>
        </div>

        <div className="mt-6 space-y-2 text-start text-sm">
          <div className="flex justify-between gap-4 border-b border-border py-2">
            <span className="text-muted">الاسم</span>
            <span className="font-semibold">{order.customerName}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-border py-2">
            <span className="text-muted">الهاتف</span>
            <span className="font-semibold" dir="ltr">
              {order.customerPhone}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-b border-border py-2">
            <span className="text-muted">العنوان</span>
            <span className="max-w-[60%] text-end font-semibold">
              {order.governorate} — {order.district} — {order.address}
            </span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="text-muted">الإجمالي</span>
            <span className="font-extrabold text-primary">
              {formatPrice(Number(order.total), {
                currencySymbol: settings.currencySymbol,
              })}
            </span>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-start text-sm">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-3 rounded-xl bg-background px-3 py-2"
            >
              <span>
                {item.nameAr} × {item.quantity}
              </span>
              <span className="font-semibold">
                {formatPrice(Number(item.total), {
                  currencySymbol: settings.currencySymbol,
                })}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            متابعة عبر واتساب
          </a>
          <Link href="/shop" className="btn-secondary">
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}
