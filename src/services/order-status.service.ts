import type { Customer, Order, OrderItem, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  shouldCommitStock,
  shouldDeleteOrder,
  shouldRestoreStock,
} from "@/lib/order-stock";

export type OrderStatusChangeResult =
  | { kind: "unchanged" }
  | { kind: "deleted"; id: string; orderNumber: string }
  | {
      kind: "updated";
      order: Order & { items: OrderItem[]; customer: Customer | null };
    };

export async function applyOrderStatusChange(
  orderId: string,
  nextStatus: OrderStatus,
): Promise<OrderStatusChangeResult> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    if (existing.status === nextStatus) {
      return { kind: "unchanged" };
    }

    const commit = shouldCommitStock({
      from: existing.status,
      to: nextStatus,
      stockCommitted: existing.stockCommitted,
    });
    const restore = shouldRestoreStock({
      to: nextStatus,
      stockCommitted: existing.stockCommitted,
    });

    if (commit) {
      for (const item of existing.items) {
        if (!item.productId) continue;
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
        if (updated.count === 0) {
          throw new Error("STOCK");
        }
      }
    }

    if (restore) {
      for (const item of existing.items) {
        if (!item.productId) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { soldCount: true },
        });
        if (!product) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: Math.max(0, product.soldCount - item.quantity),
          },
        });
      }
    }

    if (shouldDeleteOrder(nextStatus)) {
      await tx.order.delete({ where: { id: orderId } });
      return {
        kind: "deleted",
        id: orderId,
        orderNumber: existing.orderNumber,
      };
    }

    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        stockCommitted: existing.stockCommitted || commit,
      },
      include: { items: true, customer: true },
    });

    return { kind: "updated", order };
  });
}
