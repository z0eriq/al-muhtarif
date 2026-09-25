import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { ProductGrid } from "@/components/products/product-grid";
import type { SerializedProduct } from "@/services/products.service";

type NewProductsProps = {
  products: SerializedProduct[];
  currencySymbol?: string;
};

export function NewProducts({
  products,
  currencySymbol = "د.ع",
}: NewProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 md:py-16">
      <div className="container-store">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold md:text-3xl">
                وصل حديثاً
              </h2>
              <p className="mt-2 text-sm text-muted md:text-base">
                أحدث الإضافات إلى متجر المحترف
              </p>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-sm font-semibold text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <ProductGrid products={products} currencySymbol={currencySymbol} />
        </Reveal>
      </div>
    </section>
  );
}
