"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";

type WishlistPageClientProps = {
  currencySymbol?: string;
};

export function WishlistPageClient({
  currencySymbol = "د.ع",
}: WishlistPageClientProps) {
  const { items, removeItem, clear } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="المفضلة فارغة"
        description="أضف منتجات إلى المفضلة من بطاقة المنتج لتجدها هنا بسهولة."
        action={
          <Link href="/shop" className="btn-primary">
            تصفح المتجر
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{items.length} منتج في المفضلة</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clear();
            toast.success("تم تفريغ المفضلة");
          }}
        >
          تفريغ الكل
        </Button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-primary-soft"
            >
              <Image
                src={item.image || "/logo.png"}
                alt={item.nameAr}
                fill
                className="object-cover"
                sizes="96px"
              />
            </Link>

            <div className="min-w-0 flex-1 space-y-1">
              <Link
                href={`/product/${item.slug}`}
                className="font-bold text-foreground transition hover:text-primary"
              >
                {item.nameAr}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-primary">
                  {formatPrice(item.price, { currencySymbol })}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.price ? (
                  <span className="text-sm text-muted line-through">
                    {formatPrice(item.compareAtPrice, { currencySymbol })}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  addItem({
                    productId: item.productId,
                    slug: item.slug,
                    nameAr: item.nameAr,
                    price: item.price,
                    image: item.image,
                    stock: 99,
                    compareAtPrice: item.compareAtPrice,
                    quantity: 1,
                  });
                  toast.success(`تمت إضافة «${item.nameAr}» إلى السلة`);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                أضف للسلة
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  removeItem(item.productId);
                  toast.success("تمت الإزالة من المفضلة");
                }}
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
