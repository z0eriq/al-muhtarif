import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { ProductGrid } from "@/components/products/product-grid";
import type { SerializedProduct } from "@/services/products.service";

type FeaturedProductsProps = {
  products: SerializedProduct[];
  currencySymbol?: string;
};

export function FeaturedProducts({
  products,
  currencySymbol = "د.ع",
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-14 md:py-16">
      <div className="container-store">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold md:text-3xl">
                منتجات مميزة
              </h2>
              <p className="mt-2 text-sm text-muted md:text-base">
                اختياراتنا الأكثر طلباً لهذا الأسبوع
              </p>
            </div>
            <Link
              href="/shop?featured=1"
              className="text-sm font-semibold text-primary hover:underline"
            >
              عرض المزيد
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
