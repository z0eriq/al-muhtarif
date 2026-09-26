import { cache } from "react";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { PaginatedResult, ProductFilters } from "@/types";

export type SerializedProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type SerializedCategoryRef = {
  id: string;
  nameAr: string;
  slug: string;
};

export type SerializedProduct = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  sku: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  installmentAvailable: boolean;
  installmentUrl: string | null;
  tags: string[];
  specifications: Record<string, string> | null;
  soldCount: number;
  images: SerializedProductImage[];
  categories: SerializedCategoryRef[];
  createdAt: string;
  updatedAt: string;
};

function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return Number(value);
}

function serializeProduct(
  product: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    slug: string;
    sku: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    price: { toString(): string } | number;
    compareAtPrice: { toString(): string } | number | null;
    stock: number;
    lowStockThreshold: number;
    status: string;
    isFeatured: boolean;
    isNew: boolean;
    installmentAvailable: boolean;
    installmentUrl: string | null;
    tags: string[];
    specifications: Prisma.JsonValue | null;
    soldCount: number;
    images: Array<{
      id: string;
      url: string;
      alt: string | null;
      sortOrder: number;
    }>;
    categories: Array<{
      category: { id: string; nameAr: string; slug: string };
    }>;
    createdAt: Date;
    updatedAt: Date;
  },
): SerializedProduct {
  let specifications: Record<string, string> | null = null;
  if (
    product.specifications &&
    typeof product.specifications === "object" &&
    !Array.isArray(product.specifications)
  ) {
    specifications = Object.fromEntries(
      Object.entries(product.specifications as Record<string, unknown>)
        .filter(([, v]) => typeof v === "string")
        .map(([k, v]) => [k, String(v)]),
    );
  }

  return {
    id: product.id,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
    slug: product.slug,
    sku: product.sku,
    descriptionAr: product.descriptionAr,
    descriptionEn: product.descriptionEn,
    price: toNumber(product.price),
    compareAtPrice:
      product.compareAtPrice == null ? null : toNumber(product.compareAtPrice),
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    installmentAvailable: product.installmentAvailable,
    installmentUrl: product.installmentUrl,
    tags: product.tags,
    specifications,
    soldCount: product.soldCount,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    categories: product.categories.map((pc) => ({
      id: pc.category.id,
      nameAr: pc.category.nameAr,
      slug: pc.category.slug,
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: {
    include: {
      category: {
        select: { id: true, nameAr: true, slug: true },
      },
    },
  },
} satisfies Prisma.ProductInclude;

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { nameAr: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  if (filters.category) {
    where.categories = {
      some: {
        category: {
          OR: [{ slug: filters.category }, { id: filters.category }],
          isActive: true,
        },
      },
    };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  if (filters.onSale) {
    where.compareAtPrice = { not: null };
  }

  if (filters.featured) {
    where.isFeatured = true;
  }

  return where;
}

function buildOrderBy(
  sort?: ProductFilters["sort"],
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "bestselling":
      return { soldCount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function listProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResult<SerializedProduct>> {
  await connection();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(48, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const where = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);

  // compareAtPrice > price needs post-filter (Prisma can't compare columns easily)
  if (filters.onSale) {
    const rows = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
    });

    const all = rows
      .map(serializeProduct)
      .filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);

    const total = all.length;
    const items = all.slice((page - 1) * pageSize, page * pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(serializeProduct),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const getProductBySlug = cache(async (slug: string) => {
  await connection();
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productInclude,
  });

  return product ? serializeProduct(product) : null;
});

export async function getFeatured(limit = 8): Promise<SerializedProduct[]> {
  await connection();
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map(serializeProduct);
}

export async function getNew(limit = 8): Promise<SerializedProduct[]> {
  await connection();
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", isNew: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serializeProduct);
}

export async function getOffers(limit = 8): Promise<SerializedProduct[]> {
  await connection();
  const rows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      compareAtPrice: { not: null },
    },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
    take: limit * 2,
  });

  return rows
    .map(serializeProduct)
    .filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price)
    .slice(0, limit);
}

export async function getRelated(
  productId: string,
  categoryIds: string[],
  limit = 4,
): Promise<SerializedProduct[]> {
  await connection();
  const rows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: productId },
      ...(categoryIds.length
        ? {
            categories: {
              some: { categoryId: { in: categoryIds } },
            },
          }
        : {}),
    },
    include: productInclude,
    orderBy: { soldCount: "desc" },
    take: limit,
  });

  return rows.map(serializeProduct);
}
