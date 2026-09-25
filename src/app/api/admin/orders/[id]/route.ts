import { NextRequest } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";

function serializeOrder<
  T extends {
    subtotal: unknown;
    discount: unknown;
    total: unknown;
    items?: Array<{ price: unknown; total: unknown }>;
  },
>(order: T) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items?.map((item) => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
    })),
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("orders:update");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return jsonError("الطلب غير موجود", 404);

    const body = await request.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("حالة الطلب غير صالحة", 400, zodIssues(parsed.error));
    }

    const status = parsed.data.status as OrderStatus;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        customer: true,
      },
    });

    return jsonSuccess(serializeOrder(order), "تم تحديث حالة الطلب");
  } catch (error) {
    console.error("update order", error);
    return jsonError("فشل تحديث الطلب", 500);
  }
}
