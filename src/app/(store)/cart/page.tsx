import { CartPageClient } from "@/components/cart/cart-page-client";
import { getSettings } from "@/services/settings.service";

export async function generateMetadata() {
  return { title: "السلة" };
}

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className="container-store py-8 md:py-10">
      <h1 className="mb-8 font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
        سلة المشتريات
      </h1>
      <CartPageClient currencySymbol={settings.currencySymbol} />
    </div>
  );
}
