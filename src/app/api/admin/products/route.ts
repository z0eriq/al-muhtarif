import { NextRequest } from "next/server";
import type { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
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

export async function GET(request: NextRequest) {
  const authResult = await requireAuth("products:view");
  if (!authResult.ok) return authResult.response;

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") as ProductStatus | null;
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? ADMIN_PAGE_SIZE)),
  );

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
        categories: { include: { category: { select: { id: true, nameAr: true } } } },
        _count: { select: { orderItems: true } },
      },
    }),
  ]);

  return jsonSuccess({
    items: items.map(serializeProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth("products:create");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات المنتج غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existingSlug) {
      return jsonError("الرابط المختصر مستخدم مسبقاً");
    }

    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true },
      });
      if (existingSku) {
        return jsonError("رمز SKU مستخدم مسبقاً");
      }
    }

    const product = await prisma.product.create({
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

    revalidateStorefront([`/product/${product.slug}`]);
    return jsonSuccess(serializeProduct(product), "تم إنشاء المنتج بنجاح", 201);
  } catch (error) {
    console.error("create product", error);
    return jsonError("فشل إنشاء المنتج", 500);
  }
}
