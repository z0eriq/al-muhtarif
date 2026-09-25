import { CategoriesSection } from "@/components/home/categories-section";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSection } from "@/components/home/hero-section";
import { NewProducts } from "@/components/home/new-products";
import { OffersSection } from "@/components/home/offers-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import { listActiveCategories } from "@/services/categories.service";
import {
  getFeatured,
  getNew,
  getOffers,
} from "@/services/products.service";
import { getHomeContent, getSettings } from "@/services/settings.service";

export default async function HomePage() {
  const [settings, home, categories, featured, newest, offers] =
    await Promise.all([
      getSettings(),
      getHomeContent(),
      listActiveCategories(),
      getFeatured(8),
      getNew(8),
      getOffers(8),
    ]);

  return (
    <>
      <HeroSection content={home} storeNameAr={settings.storeNameAr} />
      <CategoriesSection categories={categories} />
      <FeaturedProducts
        products={featured}
        currencySymbol={settings.currencySymbol}
      />
      <OffersSection
        products={offers}
        currencySymbol={settings.currencySymbol}
      />
      <NewProducts
        products={newest}
        currencySymbol={settings.currencySymbol}
      />
      <WhyUsSection items={home.whyUsItems} />
      <CtaSection content={home} />
    </>
  );
}
