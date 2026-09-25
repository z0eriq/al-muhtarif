import { ProductCard } from "@/components/products/product-card";
import type { SerializedProduct } from "@/services/products.service";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: SerializedProduct[];
  currencySymbol?: string;
  className?: string;
};

export function ProductGrid({
  products,
  currencySymbol = "د.ع",
  className,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currencySymbol={currencySymbol}
        />
      ))}
    </div>
  );
}
