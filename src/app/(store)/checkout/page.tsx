import { CheckoutFormClient } from "@/components/checkout/checkout-form-client";
import { getSettings } from "@/services/settings.service";

export async function generateMetadata() {
  return { title: "إتمام الطلب" };
}

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <div className="container-store py-8 md:py-10">
      <h1 className="mb-8 font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
        إتمام الطلب
      </h1>
      <CheckoutFormClient currencySymbol={settings.currencySymbol} />
    </div>
  );
}
