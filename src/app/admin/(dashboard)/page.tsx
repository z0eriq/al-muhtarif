import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

export const metadata = { title: "لوحة التحكم" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "المدير";

  const now = new Date();
  const weekStart = startOfDay(subDays(now, 6));
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { lowStockAlert: true },
  });
  const lowThreshold = settings?.lowStockAlert ?? 5;

  const [
    salesAgg,
    ordersCount,
    newOrdersCount,
    productsCount,
    lowStockCount,
    customersCount,
    recentOrders,
    topProducts,
    weekOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.product.count(),
    prisma.product.count({
      where: {
        status: { not: "DISABLED" },
        stock: { lte: lowThreshold },
      },
    }),
    prisma.customer.count(),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { soldCount: "desc" },
      select: {
        id: true,
        nameAr: true,
        soldCount: true,
        price: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: weekStart },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, total: true },
    }),
  ]);

  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(now, 6 - i));
    const key = format(day, "yyyy-MM-dd");
    const dayOrders = weekOrders.filter(
      (o) => format(o.createdAt, "yyyy-MM-dd") === key,
    );
    return {
      date: key,
      label: format(day, "EEE", { locale: ar }),
      total: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء المتجر"
        userName={userName}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="إجمالي المبيعات"
          value={Number(salesAgg._sum.total ?? 0)}
          formatKind="price"
          icon="sales"
          tone="primary"
        />
        <StatCard
          title="عدد الطلبات"
          value={ordersCount}
          icon="orders"
          tone="accent"
        />
        <StatCard
          title="طلبات جديدة"
          value={newOrdersCount}
          icon="newOrders"
          tone="warning"
          hint="بانتظار المعالجة"
        />
        <StatCard
          title="المنتجات"
          value={productsCount}
          icon="products"
          tone="success"
        />
        <StatCard
          title="مخزون منخفض"
          value={lowStockCount}
          icon="lowStock"
          tone="danger"
          hint={`حد التنبيه: ${lowThreshold}`}
        />
        <StatCard
          title="العملاء"
          value={customersCount}
          icon="customers"
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SalesChart data={salesByDay} />
        </div>

        <div className="card-surface p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">الأكثر مبيعاً</h3>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <ul className="space-y-3">
            {topProducts.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted">لا توجد منتجات بعد</li>
            ) : (
              topProducts.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url ?? "/logo.png"}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.nameAr}</p>
                    <p className="text-xs text-muted">
                      {product.soldCount} مبيعة · {formatPrice(Number(product.price))}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "number", header: "رقم الطلب" },
          { key: "customer", header: "العميل" },
          { key: "total", header: "الإجمالي" },
          { key: "status", header: "الحالة" },
          { key: "date", header: "التاريخ" },
        ]}
        isEmpty={recentOrders.length === 0}
        emptyMessage="لا توجد طلبات بعد"
        toolbar={
          <>
            <h3 className="text-lg font-bold">أحدث الطلبات</h3>
            <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
              كل الطلبات
            </Link>
          </>
        }
      >
        {recentOrders.map((order) => (
          <DataTableRow key={order.id}>
            <DataTableCell>
              <Link
                href={`/admin/orders/${order.id}`}
                className="font-semibold text-primary hover:underline"
              >
                {order.orderNumber}
              </Link>
            </DataTableCell>
            <DataTableCell>{order.customerName}</DataTableCell>
            <DataTableCell>{formatPrice(Number(order.total))}</DataTableCell>
            <DataTableCell>
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </DataTableCell>
            <DataTableCell className="text-muted">
              {format(order.createdAt, "dd/MM/yyyy HH:mm")}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </div>
  );
}
