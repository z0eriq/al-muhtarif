import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { ProductGrid } from "@/components/products/product-grid";
import type { SerializedProduct } from "@/services/products.service";

type OffersSectionProps = {
  products: SerializedProduct[];
  currencySymbol?: string;
};

export function OffersSection({
  products,
  currencySymbol = "د.ع",
}: OffersSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-y border-border bg-gradient-to-l from-primary-light/60 via-white to-primary-soft/40 py-14 md:py-16">
      <div className="container-store">
        <Reveal>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold text-primary md:text-3xl">
                عروض خاصة
              </h2>
              <p className="mt-2 text-sm text-muted md:text-base">
                وفر الآن على منتجات مختارة بأسعار مخفّضة
              </p>
            </div>
            <Link
              href="/shop?onSale=1"
              className="text-sm font-semibold text-primary hover:underline"
            >
              كل العروض
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
