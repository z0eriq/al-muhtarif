import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryBySlug } from "@/services/categories.service";
import { listProducts } from "@/services/products.service";
import { getSettings } from "@/services/settings.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "تصنيف غير موجود" };
  return {
    title: category.nameAr,
    description: category.description ?? undefined,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);

  const [category, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getSettings(),
  ]);

  if (!category) notFound();

  const result = await listProducts({
    category: category.slug,
    page,
    pageSize: 12,
    sort: "newest",
  });

  return (
    <div className="container-store py-8 md:py-10">
      <nav className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/categories" className="hover:text-primary">
              التصنيفات
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-foreground">{category.nameAr}</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
          {category.nameAr}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            {category.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">{result.total} منتج</p>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="لا توجد منتجات في هذا التصنيف"
          description="تحقق لاحقاً أو تصفح باقي التصنيفات."
          action={
            <Link href="/shop" className="btn-primary">
              تصفح المتجر
            </Link>
          }
        />
      ) : (
        <>
          <ProductGrid
            products={result.items}
            currencySymbol={settings.currencySymbol}
          />
          {result.totalPages > 1 ? (
            <nav className="mt-8 flex flex-wrap justify-center gap-2">
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={
                      p === 1
                        ? `/categories/${slug}`
                        : `/categories/${slug}?page=${p}`
                    }
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold ${
                      p === result.page
                        ? "bg-primary text-white"
                        : "border border-border bg-white"
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
