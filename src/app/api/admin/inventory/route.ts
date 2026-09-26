import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryAdjustSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth("inventory:manage");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = inventoryAdjustSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات المخزون غير صالحة", 400, zodIssues(parsed.error));
    }

    const { productId, stock, lowStockThreshold } = parsed.data;
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!existing) return jsonError("المنتج غير موجود", 404);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock,
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
      },
      select: {
        id: true,
        nameAr: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        status: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    revalidateStorefront();
    return jsonSuccess(product, "تم تحديث المخزون");
  } catch (error) {
    console.error("inventory adjust", error);
    return jsonError("فشل تحديث المخزون", 500);
  }
}
