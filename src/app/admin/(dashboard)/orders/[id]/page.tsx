import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export const metadata = { title: "تفاصيل الطلب" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <AdminTopbar
        title={`طلب ${order.orderNumber}`}
        subtitle={ORDER_STATUS_LABELS[order.status]}
        userName={session?.user?.name ?? "المدير"}
      />

      <OrderStatusForm orderId={order.id} currentStatus={order.status} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-surface space-y-3 p-5 lg:col-span-1">
          <h3 className="font-bold">بيانات العميل</h3>
          <Info label="الاسم" value={order.customerName} />
          <Info label="الهاتف" value={order.customerPhone} dir="ltr" />
          <Info label="البريد" value={order.customerEmail || "—"} dir="ltr" />
          <Info label="المحافظة" value={order.governorate} />
          <Info label="المنطقة" value={order.district} />
          <Info label="العنوان" value={order.address} />
          {order.notes ? <Info label="ملاحظات" value={order.notes} /> : null}
          <Info
            label="تاريخ الطلب"
            value={format(order.createdAt, "dd/MM/yyyy HH:mm")}
          />
        </section>

        <section className="card-surface overflow-hidden lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-bold">عناصر الطلب</h3>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/logo.png"}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.nameAr}</p>
                  <p className="text-xs text-muted">
                    {item.quantity} × {formatPrice(Number(item.price))}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(Number(item.total))}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-border bg-primary-soft/30 px-5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">المجموع الفرعي</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">الخصم</span>
              <span>{formatPrice(Number(order.discount))}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>الإجمالي</span>
              <span className="text-primary">{formatPrice(Number(order.total))}</span>
            </div>
            {order.couponCode ? (
              <p className="text-xs text-muted">قسيمة: {order.couponCode}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium" dir={dir}>
        {value}
      </p>
    </div>
  );
}
