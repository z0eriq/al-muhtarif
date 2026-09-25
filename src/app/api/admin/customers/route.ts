import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonSuccess } from "@/lib/admin-auth";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth("customers:view");
  if (!authResult.ok) return authResult.response;

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? ADMIN_PAGE_SIZE)),
  );

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true },
        },
      },
    }),
  ]);

  const mapped = items.map((customer) => {
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const { orders, ...rest } = customer;
    void orders;
    return {
      ...rest,
      totalSpent,
    };
  });

  return jsonSuccess({
    items: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
