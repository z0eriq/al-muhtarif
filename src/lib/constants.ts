import type { OrderStatus, Role } from "@prisma/client";

export const STORE = {
  nameAr: "المحترف",
  nameEn: "AL MUHTARIF",
  domain: "al-muhtarif.com",
  email: "info@al-muhtraif.com",
  phone: "+964 7743571934",
  whatsapp: "+9647743571934",
  address: "العراق – بابل – الحلة – شارع 40",
  workingHours: "السبت – الخميس: 9:00 ص – 9:00 م",
  currency: "IQD" as const,
  currencySymbol: "د.ع",
  logo: "/logo.png",
  logoIcon: "/logo-icon.png",
  favicon: "/logo-icon.png",
  mapsShareUrl: "https://maps.app.goo.gl/cgcFdUcUBdXa6EKWA",
  mapsLat: 32.4890853,
  mapsLng: 44.4314874,
  mapsEmbedUrl:
    "https://www.google.com/maps?q=32.4890853,44.4314874&z=17&hl=ar&output=embed",
} as const;

export const SOCIAL_DEFAULTS = {
  facebookUrl: "https://www.facebook.com/professionaltecnostore",
  instagramUrl: "https://www.instagram.com/pro_40st",
  twitterUrl: null as string | null,
  youtubeUrl: null as string | null,
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "جديد",
  CONFIRMED: "تم التأكيد",
  PREPARING: "قيد التجهيز",
  READY: "جاهز للتوصيل",
  SHIPPED: "تم الشحن",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "مدير أعلى",
  ADMIN: "مدير",
  MANAGER: "مشرف",
  STAFF: "موظف",
};

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المتجر" },
  { href: "/categories", label: "التصنيفات" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
] as const;

export const IRAQ_GOVERNORATES = [
  "بغداد",
  "البصرة",
  "نينوى",
  "أربيل",
  "النجف",
  "كربلاء",
  "بابل",
  "ديالى",
  "الأنبار",
  "ذي قار",
  "القادسية",
  "كركوك",
  "السليمانية",
  "واسط",
  "ميسان",
  "صلاح الدين",
  "دهوك",
  "المثنى",
] as const;

export type IraqGovernorate = (typeof IRAQ_GOVERNORATES)[number];

export const PRODUCT_STATUS_LABELS = {
  ACTIVE: "نشط",
  DRAFT: "مسودة",
  DISABLED: "معطّل",
} as const;

export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
