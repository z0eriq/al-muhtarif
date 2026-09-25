import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGrid } from "@/components/products/product-grid";
import {
  ShopFilters,
  ShopFiltersMobile,
} from "@/components/shop/shop-filters";
import { listActiveCategories } from "@/services/categories.service";
import { listProducts } from "@/services/products.service";
import { getSettings } from "@/services/settings.service";
import type { ProductFilters } from "@/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const page = Number(get("page") ?? "1");
  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const sort = get("sort") as ProductFilters["sort"] | undefined;

  return {
    q: get("q") || undefined,
    category: get("category") || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock: get("inStock") === "1",
    onSale: get("onSale") === "1",
    featured: get("featured") === "1",
    sort:
      sort === "price-asc" ||
      sort === "price-desc" ||
      sort === "bestselling" ||
      sort === "newest"
        ? sort
        : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: 12,
  };
}

function buildPageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) sp.set(key, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export async function generateMetadata() {
  return {
    title: "المتجر",
    description: "تصفح جميع منتجات المحترف",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [settings, categories, result] = await Promise.all([
    getSettings(),
    listActiveCategories(),
    listProducts(filters),
  ]);

  return (
    <div className="container-store py-8 md:py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
          المتجر
        </h1>
        <p className="mt-2 text-sm text-muted">
          {result.total} منتج متاح
          {filters.q ? ` · نتائج البحث عن «${filters.q}»` : ""}
        </p>
      </div>

      <div className="mb-4 lg:hidden">
        <Suspense fallback={null}>
          <ShopFiltersMobile categories={categories} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={null}>
          <ShopFilters categories={categories} />
        </Suspense>

        <div>
          {result.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="لا توجد منتجات"
              description="جرّب تغيير الفلاتر أو البحث بكلمة أخرى."
              action={
                <Link href="/shop" className="btn-primary">
                  إعادة تعيين الفلاتر
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
                <nav
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  aria-label="ترقيم الصفحات"
                >
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={buildPageHref(params, page)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                          page === result.page
                            ? "bg-primary text-white"
                            : "border border-border bg-white text-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
