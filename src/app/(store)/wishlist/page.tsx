import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";
import { getSettings } from "@/services/settings.service";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "المنتجات المحفوظة في المفضلة",
};

export default async function WishlistPage() {
  const settings = await getSettings();

  return (
    <div className="container-store py-8 md:py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
          المفضلة
        </h1>
        <p className="mt-2 text-sm text-muted">
          احفظ المنتجات التي تعجبك للعودة إليها لاحقاً
        </p>
      </div>
      <WishlistPageClient currencySymbol={settings.currencySymbol} />
    </div>
  );
}
