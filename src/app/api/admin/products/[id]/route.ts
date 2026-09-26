import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

function serializeProduct<T extends { price: unknown; compareAtPrice?: unknown }>(
  product: T,
) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice == null ? null : Number(product.compareAtPrice),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("products:view");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!product) return jsonError("المنتج غير موجود", 404);
  return jsonSuccess(serializeProduct(product));
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("products:update");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return jsonError("المنتج غير موجود", 404);

    const body = await request.json();

    // Allow quick status-only updates
    if (body && typeof body === "object" && Object.keys(body).length === 1 && "status" in body) {
      const status = body.status;
      if (!["ACTIVE", "DRAFT", "DISABLED"].includes(status)) {
        return jsonError("حالة المنتج غير صالحة");
      }
      const updated = await prisma.product.update({
        where: { id },
        data: { status },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          categories: { include: { category: true } },
        },
      });
      revalidateStorefront([`/product/${updated.slug}`]);
      return jsonSuccess(serializeProduct(updated), "تم تحديث حالة المنتج");
    }

    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات المنتج غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;

    if (data.slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (slugTaken) return jsonError("الرابط المختصر مستخدم مسبقاً");
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true },
      });
      if (skuTaken) return jsonError("رمز SKU مستخدم مسبقاً");
    }

    const product = await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          nameAr: data.nameAr,
          nameEn: data.nameEn || null,
          slug: data.slug,
          sku: data.sku || null,
          descriptionAr: data.descriptionAr || null,
          descriptionEn: data.descriptionEn || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          stock: data.stock,
          lowStockThreshold: data.lowStockThreshold,
          status: data.status,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          installmentAvailable: data.installmentAvailable,
          installmentUrl: data.installmentUrl || null,
          tags: data.tags,
          specifications: data.specifications ?? undefined,
          categories: {
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          },
          images: {
            create: data.images.map((img, index) => ({
              url: img.url,
              alt: img.alt ?? null,
              sortOrder: img.sortOrder ?? index,
            })),
          },
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          categories: { include: { category: true } },
        },
      });
    });

    revalidateStorefront([`/product/${product.slug}`]);
    return jsonSuccess(serializeProduct(product), "تم تحديث المنتج بنجاح");
  } catch (error) {
    console.error("update product", error);
    return jsonError("فشل تحديث المنتج", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("products:delete");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return jsonError("المنتج غير موجود", 404);

    await prisma.product.delete({ where: { id } });
    revalidateStorefront(existing.slug ? [`/product/${existing.slug}`] : []);
    return jsonSuccess({ id }, "تم حذف المنتج");
  } catch (error) {
    console.error("delete product", error);
    return jsonError("فشل حذف المنتج. قد يكون مرتبطاً بطلبات", 500);
  }
}
