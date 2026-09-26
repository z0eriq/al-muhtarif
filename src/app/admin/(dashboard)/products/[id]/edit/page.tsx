import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "تعديل منتج" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        categories: true,
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { nameAr: "asc" },
      select: { id: true, nameAr: true },
    }),
  ]);

  if (!product) notFound();

  const specs =
    product.specifications &&
    typeof product.specifications === "object" &&
    !Array.isArray(product.specifications)
      ? (product.specifications as Record<string, string>)
      : {};

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="تعديل منتج"
        subtitle={product.nameAr}
        userName={session?.user?.name ?? "المدير"}
      />
      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        initial={{
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          slug: product.slug,
          sku: product.sku,
          descriptionAr: product.descriptionAr,
          descriptionEn: product.descriptionEn,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          status: product.status,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          installmentAvailable: product.installmentAvailable,
          installmentUrl: product.installmentUrl,
          tags: product.tags,
          categoryIds: product.categories.map((c) => c.categoryId),
          images: product.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: img.sortOrder,
          })),
          specifications: specs,
        }}
      />
    </div>
  );
}
