"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct } from "@/services/products.service";
import { productMetaData, trackMetaEvent } from "@/components/analytics/track-meta";
import { InstallmentLink } from "@/components/products/installment-link";

type ProductCardProps = {
  product: SerializedProduct;
  currencySymbol?: string;
};

export function ProductCard({
  product,
  currencySymbol = "د.ع",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const wished = hasItem(product.id);
  const image = product.images[0]?.url ?? "/logo.png";
  const inStock = product.stock > 0;
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      image,
      stock: product.stock,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
    });
    trackMetaEvent(
      "AddToCart",
      productMetaData({
        id: product.id,
        nameAr: product.nameAr,
        price: product.price,
        quantity: 1,
      }),
    );
    toast.success(`تمت إضافة «${product.nameAr}» إلى السلة`);
  };

  const handleWishlist = () => {
    toggleItem({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      image,
      compareAtPrice: product.compareAtPrice,
    });
    toast.success(wished ? "تمت الإزالة من المفضلة" : "أُضيف إلى المفضلة");
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-brand">
      <div className="relative aspect-square overflow-hidden bg-primary-soft">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={image}
            alt={product.images[0]?.alt ?? product.nameAr}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {hasDiscount ? (
            <Badge variant="sale">خصم {discountPercent}%</Badge>
          ) : null}
          {product.isNew ? <Badge>جديد</Badge> : null}
          {product.installmentAvailable && product.installmentUrl ? (
            <Badge>تقسيط</Badge>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-muted shadow-sm transition hover:text-danger"
        >
          <Heart
            className={`h-4 w-4 ${wished ? "fill-danger text-danger" : ""}`}
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-3 justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <div className="mb-3 flex gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lg backdrop-blur">
            <Button
              size="sm"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="h-9"
            >
              <ShoppingCart className="h-4 w-4" />
              أضف
            </Button>
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-primary transition hover:bg-primary-light"
            >
              <Eye className="h-4 w-4" />
              تفاصيل
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {product.categories[0] ? (
            <p className="text-xs text-muted">{product.categories[0].nameAr}</p>
          ) : null}
          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-foreground transition hover:text-primary md:text-base">
              {product.nameAr}
            </h3>
          </Link>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-base font-bold text-primary md:text-lg">
              {formatPrice(product.price, { currencySymbol })}
            </span>
            {hasDiscount ? (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice!, { currencySymbol })}
              </span>
            ) : null}
          </div>

          <p
            className={`text-xs font-medium ${inStock ? "text-success" : "text-danger"}`}
          >
            {inStock ? `متوفر (${product.stock})` : "غير متوفر"}
          </p>

          <InstallmentLink
            compact
            installmentAvailable={product.installmentAvailable}
            installmentUrl={product.installmentUrl}
          />

          <div className="flex gap-2 md:hidden">
            <Button
              className="flex-1"
              size="sm"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              أضف للسلة
            </Button>
            <Link
              href={`/product/${product.slug}`}
              aria-label="عرض التفاصيل"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-[1.5px] border-border bg-white text-primary transition hover:border-primary hover:bg-primary-light"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
