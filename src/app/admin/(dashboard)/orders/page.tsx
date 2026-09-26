import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ADMIN_PAGE_SIZE, ORDER_STATUS_LABELS } from "@/lib/constants";
import {
  adminOrdersHref,
  orderSearchWhere,
  parseOrderStatus,
} from "@/lib/order-search";
import { AdminTopbar } from "@/components/admin/topbar";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

export const metadata = { title: "الطلبات" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = parseOrderStatus(
    typeof params.status === "string" ? params.status : null,
  );
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = ADMIN_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...orderSearchWhere(q),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: { select: { nameAr: true, quantity: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="الطلبات"
        subtitle="متابعة ومعالجة طلبات العملاء"
        userName={session?.user?.name ?? "المدير"}
      />

      <form className="flex flex-wrap gap-2" action="/admin/orders">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث برقم الطلب أو الاسم أو الهاتف أو المنتج..."
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="btn-primary py-2.5 text-sm">
          بحث
        </button>
        {q ? (
          <Link
            href={adminOrdersHref({ status })}
            className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-muted hover:border-primary hover:text-primary"
          >
            مسح
          </Link>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        <FilterChip href={adminOrdersHref({ q })} active={!status} label="الكل" />
        {(Object.keys(ORDER_STATUS_LABELS) as Array<keyof typeof ORDER_STATUS_LABELS>).map(
          (key) => (
            <FilterChip
              key={key}
              href={adminOrdersHref({ q, status: key })}
              active={status === key}
              label={ORDER_STATUS_LABELS[key]}
            />
          ),
        )}
      </div>

      <DataTable
        columns={[
          { key: "number", header: "رقم الطلب" },
          { key: "customer", header: "العميل" },
          { key: "phone", header: "الهاتف" },
          { key: "items", header: "المنتجات" },
          { key: "total", header: "الإجمالي" },
          { key: "status", header: "الحالة" },
          { key: "date", header: "التاريخ" },
        ]}
        isEmpty={orders.length === 0}
        emptyMessage={q ? "لا توجد طلبات مطابقة للبحث" : "لا توجد طلبات"}
      >
        {orders.map((order) => (
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
            <DataTableCell dir="ltr">{order.customerPhone}</DataTableCell>
            <DataTableCell>
              <p className="max-w-[18rem] truncate text-sm">
                {order.items
                  .map((item) => `${item.nameAr} × ${item.quantity}`)
                  .join("، ") || "—"}
              </p>
            </DataTableCell>
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

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {total} طلب · صفحة {page} من {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={adminOrdersHref({ q, status, page: page - 1 })}
            >
              السابق
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={adminOrdersHref({ q, status, page: page + 1 })}
            >
              التالي
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-white text-muted hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
