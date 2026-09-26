import type { OrderStatus, Prisma } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { normalizeOrderNumber } from "@/lib/order-stock";

export function parseOrderStatus(
  value: string | null | undefined,
): OrderStatus | null {
  if (!value || !(value in ORDER_STATUS_LABELS)) return null;
  return value as OrderStatus;
}

export function orderSearchWhere(rawQuery: string): Prisma.OrderWhereInput {
  const term = rawQuery.trim();
  if (!term) return {};

  const digits = term.replace(/\D/g, "");
  const orderNumber = normalizeOrderNumber(term);
  const or: Prisma.OrderWhereInput[] = [
    { orderNumber: { contains: term, mode: "insensitive" } },
    { customerName: { contains: term, mode: "insensitive" } },
    { customerPhone: { contains: term } },
    { customerEmail: { contains: term, mode: "insensitive" } },
    {
      items: {
        some: {
          OR: [
            { nameAr: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
            { sku: { contains: term, mode: "insensitive" } },
          ],
        },
      },
    },
  ];

  if (orderNumber && orderNumber.toLowerCase() !== term.toLowerCase()) {
    or.push({ orderNumber: { contains: orderNumber, mode: "insensitive" } });
  }

  if (digits.length >= 4) {
    or.push({ customerPhone: { contains: digits } });
  }

  return { OR: or };
}

export function adminOrdersHref(options: {
  q?: string;
  status?: OrderStatus | null;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (options.q?.trim()) params.set("q", options.q.trim());
  if (options.status) params.set("status", options.status);
  if (options.page && options.page > 1) params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}
