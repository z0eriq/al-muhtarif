import { Suspense } from "react";
import type { Prisma, ProductStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductsTable } from "@/components/admin/products-table";

export const metadata = { title: "المنتجات" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status =
    typeof params.status === "string" ? (params.status as ProductStatus) : null;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = ADMIN_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { nameAr: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && ["ACTIVE", "DRAFT", "DISABLED"].includes(status)) {
    where.status = status;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { nameAr: "asc" };
  if (sort === "stock") orderBy = { stock: "asc" };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        categories: {
          include: { category: { select: { nameAr: true } } },
        },
      },
    }),
  ]);

  const products = items.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="المنتجات"
        subtitle="إدارة كتالوج المتجر"
        userName={session?.user?.name ?? "المدير"}
      />
      <Suspense fallback={<div className="skeleton h-64 w-full" />}>
        <ProductsTable
          products={products}
          total={total}
          page={page}
          totalPages={Math.max(1, Math.ceil(total / pageSize))}
          canDelete={hasPermission(role, "products:delete")}
          canUpdate={hasPermission(role, "products:update")}
        />
      </Suspense>
    </div>
  );
}
