import Image from "next/image";
import Link from "next/link";
import { listActiveCategories } from "@/services/categories.service";

export async function generateMetadata() {
  return {
    title: "التصنيفات",
    description: "تصفح تصنيفات منتجات المحترف",
  };
}

export default async function CategoriesPage() {
  const categories = await listActiveCategories();

  return (
    <div className="container-store py-8 md:py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
          التصنيفات
        </h1>
        <p className="mt-2 text-sm text-muted">
          اختر التصنيف لاستكشاف المنتجات المتاحة
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-brand"
          >
            <div className="relative aspect-[4/3] bg-primary-soft">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.nameAr}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : null}
            </div>
            <div className="space-y-1 p-4">
              <h2 className="font-bold text-foreground">{category.nameAr}</h2>
              <p className="text-sm text-muted">{category.productCount} منتج</p>
              {category.description ? (
                <p className="line-clamp-2 text-xs leading-6 text-muted">
                  {category.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
