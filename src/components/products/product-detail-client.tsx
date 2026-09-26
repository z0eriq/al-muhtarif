"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Heart, MessageCircle, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/products/quantity-selector";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  productInquiryMessage,
} from "@/lib/whatsapp";
import type { SerializedProduct } from "@/services/products.service";
import { productMetaData, trackMetaEvent } from "@/components/analytics/track-meta";
import { InstallmentLink } from "@/components/products/installment-link";

type ProductDetailClientProps = {
  product: SerializedProduct;
  whatsapp: string;
  currencySymbol: string;
};

export function ProductDetailClient({
  product,
  whatsapp,
  currencySymbol,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const [qty, setQty] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const images = product.images.length
    ? product.images
    : [{ id: "fallback", url: "/logo.png", alt: product.nameAr, sortOrder: 0 }];

  const activeImage = images[Math.min(activeIndex, images.length - 1)];
  const inStock = product.stock > 0;
  const wished = hasItem(product.id);
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  const waHref = useMemo(
    () =>
      buildWhatsAppUrl(
        whatsapp,
        productInquiryMessage(product.nameAr, {
          slug: product.slug,
          sku: product.sku,
        }),
      ),
    [whatsapp, product.nameAr, product.slug, product.sku],
  );

  useEffect(() => {
    trackMetaEvent(
      "ViewContent",
      productMetaData({
        id: product.id,
        nameAr: product.nameAr,
        price: product.price,
      }),
    );
  }, [product.id, product.nameAr, product.price]);

  const addToCart = () => {
    if (!inStock) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      price: product.price,
      image: activeImage.url,
      stock: product.stock,
      compareAtPrice: product.compareAtPrice,
      quantity: qty,
    });
    trackMetaEvent(
      "AddToCart",
      productMetaData({
        id: product.id,
        nameAr: product.nameAr,
        price: product.price,
        quantity: qty,
      }),
    );
    toast.success("تمت الإضافة إلى السلة");
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-3">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-white"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? product.nameAr}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-transform duration-500 ${zoomed ? "scale-125" : "scale-100"}`}
          />
          {hasDiscount ? (
            <Badge variant="sale" className="absolute start-4 top-4">
              عرض خاص
            </Badge>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                  index === activeIndex
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? product.nameAr}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          {product.categories[0] ? (
            <p className="text-sm font-medium text-primary">
              {product.categories[0].nameAr}
            </p>
          ) : null}
          <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold leading-tight md:text-4xl">
            {product.nameAr}
          </h1>
          {product.sku ? (
            <p className="text-sm text-muted" dir="ltr">
              SKU: {product.sku}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <span className="text-3xl font-extrabold text-primary">
            {formatPrice(product.price, { currencySymbol })}
          </span>
          {hasDiscount ? (
            <span className="text-lg text-muted line-through">
              {formatPrice(product.compareAtPrice!, { currencySymbol })}
            </span>
          ) : null}
        </div>

        <p
          className={`text-sm font-semibold ${inStock ? "text-success" : "text-danger"}`}
        >
          {inStock ? `متوفر في المخزون · ${product.stock} قطعة` : "غير متوفر حالياً"}
        </p>

        <InstallmentLink
          installmentAvailable={product.installmentAvailable}
          installmentUrl={product.installmentUrl}
        />

        {product.descriptionAr ? (
          <p className="leading-8 text-muted">{product.descriptionAr}</p>
        ) : null}

        {product.specifications &&
        Object.keys(product.specifications).length > 0 ? (
          <div className="rounded-2xl border border-border bg-white p-4">
            <h2 className="mb-3 text-sm font-bold">المواصفات</h2>
            <dl className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0"
                >
                  <dt className="text-muted">{key}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={qty}
            max={Math.max(1, product.stock)}
            onChange={setQty}
          />
          <Button onClick={addToCart} disabled={!inStock} className="min-w-40">
            <ShoppingCart className="h-4 w-4" />
            أضف إلى السلة
          </Button>
          <Button
            variant="secondary"
            onClick={buyNow}
            disabled={!inStock}
          >
            <ShoppingBag className="h-4 w-4" />
            اشترِ الآن
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              toggleItem({
                productId: product.id,
                slug: product.slug,
                nameAr: product.nameAr,
                price: product.price,
                image: activeImage.url,
                compareAtPrice: product.compareAtPrice,
              });
              toast.success(
                wished ? "تمت الإزالة من المفضلة" : "أُضيف إلى المفضلة",
              );
            }}
          >
            <Heart
              className={`h-4 w-4 ${wished ? "fill-danger text-danger" : ""}`}
            />
            المفضلة
          </Button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackMetaEvent(
                "Lead",
                productMetaData({
                  id: product.id,
                  nameAr: product.nameAr,
                  price: product.price,
                }),
              )
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
          >
            <MessageCircle className="h-4 w-4" />
            استفسار واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
