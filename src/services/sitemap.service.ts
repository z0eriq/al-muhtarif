import { prisma } from "@/lib/prisma";

export async function loadSitemapCatalog() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, image: true },
    }),
  ]);

  return {
    products: products.map((product) => ({
      slug: product.slug,
      updatedAt: product.updatedAt,
      image: product.images[0]?.url ?? null,
    })),
    categories,
  };
}
