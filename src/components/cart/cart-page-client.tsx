"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/products/quantity-selector";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export function CartPageClient({ currencySymbol = "د.ع" }: { currencySymbol?: string }) {
  const { items, updateQty, removeItem, subtotal, clear } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="سلتك فارغة"
        description="أضف منتجات من المتجر لتبدأ الطلب."
        action={
          <Link href="/shop" className="btn-primary">
            تصفح المتجر
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center"
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

            <div className="min-w-0 flex-1 space-y-2">
              <Link
                href={`/product/${item.slug}`}
                className="line-clamp-2 font-bold hover:text-primary"
              >
                {item.nameAr}
              </Link>
              <p className="text-sm font-semibold text-primary">
                {formatPrice(item.price, { currencySymbol })}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <QuantitySelector
                  size="sm"
                  value={item.quantity}
                  max={item.stock}
                  onChange={(q) => updateQty(item.productId, q)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                  className="text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>

            <p className="text-base font-bold sm:ms-auto">
              {formatPrice(item.price * item.quantity, { currencySymbol })}
            </p>
          </div>
        ))}

        <Button variant="secondary" onClick={clear} className="w-fit">
          إفراغ السلة
        </Button>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">ملخص الطلب</h2>
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted">المجموع الفرعي</span>
          <span className="font-bold">
            {formatPrice(subtotal, { currencySymbol })}
          </span>
        </div>
        <p className="mb-4 text-xs text-muted">
          الدفع عند الاستلام · رسوم التوصيل تُحدَّد حسب المنطقة
        </p>
        <Link href="/checkout" className="btn-primary w-full">
          إتمام الطلب
        </Link>
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm font-semibold text-primary hover:underline"
        >
          متابعة التسوق
        </Link>
      </aside>
    </div>
  );
}
