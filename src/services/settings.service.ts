import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import type { WhyUsItem } from "@/types";

export type StoreSettings = {
  storeNameAr: string;
  storeNameEn: string;
  logo: string;
  favicon: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  googleMapsEmbed: string | null;
  googleMapsUrl: string | null;
  currency: "IQD" | "USD";
  currencySymbol: string;
  lowStockAlert: number;
};

export type HomeContentData = {
  heroTitle: string;
  heroDescription: string;
  heroImage: string | null;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  whyUsItems: WhyUsItem[];
  ctaTitle: string;
  ctaDescription: string | null;
  ctaButtonText: string;
  aboutTitle: string | null;
  aboutContent: string | null;
};

const defaultSettings: StoreSettings = {
  storeNameAr: STORE.nameAr,
  storeNameEn: STORE.nameEn,
  logo: STORE.logo,
  favicon: STORE.favicon,
  email: STORE.email,
  phone: STORE.phone,
  whatsapp: STORE.whatsapp,
  address: STORE.address,
  workingHours: STORE.workingHours,
  facebookUrl: SOCIAL_DEFAULTS.facebookUrl,
  instagramUrl: SOCIAL_DEFAULTS.instagramUrl,
  twitterUrl: SOCIAL_DEFAULTS.twitterUrl,
  youtubeUrl: SOCIAL_DEFAULTS.youtubeUrl,
  seoTitle: `${STORE.nameAr} | ${STORE.nameEn}`,
  seoDescription:
    "متجر المحترف للأجهزة والإلكترونيات في الحلة – بابل. منتجات أصلية وخدمة موثوقة.",
  googleMapsEmbed: STORE.mapsEmbedUrl,
  googleMapsUrl: STORE.mapsShareUrl,
  currency: STORE.currency,
  currencySymbol: STORE.currencySymbol,
  lowStockAlert: 5,
};

const defaultHomeContent: HomeContentData = {
  heroTitle: "المحترف لتقنية المستقبل",
  heroDescription:
    "أحدث الهواتف، اللابتوبات، والإكسسوارات بأسعار تنافسية وخدمة توصيل داخل العراق.",
  heroImage: "/uploads/home-hero.svg",
  heroCtaPrimary: "تسوق الآن",
  heroCtaSecondary: "تواصل معنا",
  whyUsItems: [
    {
      title: "منتجات أصلية",
      description: "نختار بعناية أجهزة موثوقة مع ضمان واضح.",
      icon: "shield",
    },
    {
      title: "أسعار تنافسية",
      description: "عروض مستمرة وأسعار مناسبة للسوق العراقي.",
      icon: "tag",
    },
    {
      title: "توصيل سريع",
      description: "شحن موثوق داخل بابل وإلى محافظات العراق.",
      icon: "truck",
    },
    {
      title: "دعم مباشر",
      description: "تواصل معنا عبر واتساب لأي استفسار أو طلب.",
      icon: "headset",
    },
  ],
  ctaTitle: "جاهز للتسوق من المحترف؟",
  ctaDescription: "تصفح أحدث المنتجات واطلب بسهولة مع الدفع عند الاستلام.",
  ctaButtonText: "تصفح المتجر",
  aboutTitle: "من نحن",
  aboutContent:
    "المحترف متجر تقني في الحلة – بابل، يقدّم أجهزة وإلكترونيات أصلية مع خدمة عملاء قريبة منك.",
};

function parseWhyUsItems(value: unknown): WhyUsItem[] {
  if (!Array.isArray(value)) return defaultHomeContent.whyUsItems;

  const items: WhyUsItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const title = typeof record.title === "string" ? record.title : "";
    const description =
      typeof record.description === "string" ? record.description : "";
    if (!title || !description) continue;
    items.push({
      title,
      description,
      ...(typeof record.icon === "string" ? { icon: record.icon } : {}),
    });
  }

  return items.length > 0 ? items : defaultHomeContent.whyUsItems;
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  await connection();
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" },
    });

    if (!settings) return defaultSettings;

    return {
      storeNameAr: settings.storeNameAr,
      storeNameEn: settings.storeNameEn,
      logo: settings.logo,
      favicon: settings.favicon,
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      workingHours: settings.workingHours,
      facebookUrl: settings.facebookUrl ?? SOCIAL_DEFAULTS.facebookUrl,
      instagramUrl: settings.instagramUrl ?? SOCIAL_DEFAULTS.instagramUrl,
      twitterUrl: settings.twitterUrl,
      youtubeUrl: settings.youtubeUrl,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      googleMapsEmbed: settings.googleMapsEmbed ?? STORE.mapsEmbedUrl,
      googleMapsUrl: settings.googleMapsUrl ?? STORE.mapsShareUrl,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      lowStockAlert: settings.lowStockAlert,
    };
  } catch (error) {
    console.error("getSettings", error);
    return defaultSettings;
  }
});

export const getHomeContent = cache(async (): Promise<HomeContentData> => {
  await connection();
  try {
    const content = await prisma.homeContent.findUnique({
      where: { id: "main" },
    });

    if (!content) return defaultHomeContent;

    return {
      heroTitle: content.heroTitle,
      heroDescription: content.heroDescription,
      heroImage: content.heroImage,
      heroCtaPrimary: content.heroCtaPrimary,
      heroCtaSecondary: content.heroCtaSecondary,
      whyUsItems: parseWhyUsItems(content.whyUsItems),
      ctaTitle: content.ctaTitle,
      ctaDescription: content.ctaDescription,
      ctaButtonText: content.ctaButtonText,
      aboutTitle: content.aboutTitle,
      aboutContent: content.aboutContent,
    };
  } catch (error) {
    console.error("getHomeContent", error);
    return defaultHomeContent;
  }
});

export async function getPageBySlug(slug: string) {
  await connection();
  try {
    return await prisma.page.findFirst({
      where: { slug, isPublished: true },
    });
  } catch (error) {
    console.error("getPageBySlug", error);
    return null;
  }
}
