import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";
import Link from "next/link";

export const metadata = { title: "العملاء" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = ADMIN_PAGE_SIZE;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="العملاء"
        subtitle="سجل عملاء المتجر"
        userName={session?.user?.name ?? "المدير"}
      />

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="بحث بالاسم أو الهاتف..."
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="btn-primary py-2.5 text-sm">
          بحث
        </button>
      </form>

      <DataTable
        columns={[
          { key: "name", header: "الاسم" },
          { key: "phone", header: "الهاتف" },
          { key: "location", header: "الموقع" },
          { key: "orders", header: "الطلبات" },
          { key: "spent", header: "إجمالي الإنفاق" },
          { key: "date", header: "التسجيل" },
        ]}
        isEmpty={customers.length === 0}
        emptyMessage="لا يوجد عملاء"
      >
        {customers.map((customer) => {
          const spent = customer.orders.reduce(
            (sum, o) => sum + Number(o.total),
            0,
          );
          return (
            <DataTableRow key={customer.id}>
              <DataTableCell className="font-semibold">{customer.name}</DataTableCell>
              <DataTableCell dir="ltr">{customer.phone}</DataTableCell>
              <DataTableCell>
                {[customer.governorate, customer.district]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </DataTableCell>
              <DataTableCell>{customer._count.orders}</DataTableCell>
              <DataTableCell>{formatPrice(spent)}</DataTableCell>
              <DataTableCell className="text-muted">
                {format(customer.createdAt, "dd/MM/yyyy")}
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTable>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {total} عميل · صفحة {page} من {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={`/admin/customers?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page - 1}`}
            >
              السابق
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={`/admin/customers?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page + 1}`}
            >
              التالي
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
