import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import type { CategoryListItem } from "@/services/categories.service";

type CategoriesSectionProps = {
  categories: CategoryListItem[];
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-14 md:py-16">
      <div className="container-store">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold text-foreground md:text-3xl">
                تصفح التصنيفات
              </h2>
              <p className="mt-2 text-sm text-muted md:text-base">
                اختر التصنيف المناسب واكتشف أحدث المنتجات
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
            >
              عرض الكل
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <Reveal key={category.id} delay={index * 0.05}>
              <Link
                href={`/categories/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-white transition hover:-translate-y-1 hover:shadow-brand"
              >
                <div className="relative aspect-square overflow-hidden bg-primary-soft">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.nameAr}
                      fill
                      sizes="160px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="space-y-1 p-3 text-center">
                  <h3 className="text-sm font-bold text-foreground">
                    {category.nameAr}
                  </h3>
                  <p className="text-xs text-muted">
                    {category.productCount} منتج
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
