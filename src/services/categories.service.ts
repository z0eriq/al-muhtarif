import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type CategoryListItem = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  productCount: number;
};

export const listActiveCategories = cache(
  async (): Promise<CategoryListItem[]> => {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
        include: {
          _count: {
            select: {
              products: {
                where: { product: { status: "ACTIVE" } },
              },
            },
          },
        },
      });

      return categories.map((cat) => ({
        id: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        productCount: cat._count.products,
      }));
    } catch {
      return [];
    }
  },
);

export const getCategoryBySlug = cache(async (slug: string) => {
  try {
    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { product: { status: "ACTIVE" } },
            },
          },
        },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    };
  } catch {
    return null;
  }
});
