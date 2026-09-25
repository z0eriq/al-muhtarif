import { z } from "zod";
import { IRAQ_GOVERNORATES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const productSchema = z.object({
  nameAr: z.string().trim().min(2, "اسم المنتج بالعربية مطلوب"),
  nameEn: z.string().trim().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(2, "الرابط المختصر مطلوب")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط المختصر غير صالح"),
  sku: z.string().trim().optional().nullable(),
  descriptionAr: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().optional().nullable(),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, "المخزون لا يمكن أن يكون سالباً"),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  status: z.enum(["ACTIVE", "DRAFT", "DISABLED"]).default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([]),
  categoryIds: z.array(z.string().min(1)).min(1, "اختر تصنيفاً واحداً على الأقل"),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().optional().nullable(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .default([]),
  specifications: z.record(z.string(), z.string()).optional().nullable(),
});

export const categorySchema = z.object({
  nameAr: z.string().trim().min(2, "اسم التصنيف بالعربية مطلوب"),
  nameEn: z.string().trim().optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(2, "الرابط المختصر مطلوب")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط المختصر غير صالح"),
  description: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "الاسم مطلوب"),
  customerPhone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صالح"),
  customerEmail: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .optional()
    .or(z.literal(""))
    .nullable(),
  governorate: z.enum(IRAQ_GOVERNORATES, {
    message: "اختر المحافظة",
  }),
  district: z.string().trim().min(2, "المنطقة/القضاء مطلوب"),
  address: z.string().trim().min(5, "العنوان التفصيلي مطلوب"),
  notes: z.string().trim().optional().nullable(),
  paymentMethod: z.enum(["COD"]).default("COD"),
  couponCode: z.string().trim().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive("الكمية غير صالحة"),
      }),
    )
    .min(1, "السلة فارغة"),
});

export const settingsSchema = z.object({
  storeNameAr: z.string().trim().min(2, "اسم المتجر بالعربية مطلوب"),
  storeNameEn: z.string().trim().min(2, "اسم المتجر بالإنجليزية مطلوب"),
  logo: z.string().trim().min(1).default("/logo.png"),
  favicon: z.string().trim().min(1).default("/logo.png"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح"),
  phone: z.string().trim().min(8, "رقم الهاتف مطلوب"),
  whatsapp: z.string().trim().min(8, "رقم الواتساب مطلوب"),
  address: z.string().trim().min(5, "العنوان مطلوب"),
  workingHours: z.string().trim().min(2, "ساعات العمل مطلوبة"),
  facebookUrl: z.string().url().optional().or(z.literal("")).nullable(),
  instagramUrl: z.string().url().optional().or(z.literal("")).nullable(),
  twitterUrl: z.string().url().optional().or(z.literal("")).nullable(),
  youtubeUrl: z.string().url().optional().or(z.literal("")).nullable(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  googleMapsEmbed: z.string().trim().optional().nullable(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")).nullable(),
  currency: z.enum(["IQD", "USD"]).default("IQD"),
  currencySymbol: z.string().trim().min(1).default("د.ع"),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
});

export const homeContentSchema = z.object({
  heroTitle: z.string().trim().min(2),
  heroDescription: z.string().trim().min(2),
  heroImage: z.string().trim().optional().nullable(),
  heroCtaPrimary: z.string().trim().min(1).default("تسوق الآن"),
  heroCtaSecondary: z.string().trim().min(1).default("تواصل معنا"),
  whyUsItems: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        icon: z.string().trim().optional(),
      }),
    )
    .min(1),
  ctaTitle: z.string().trim().min(2),
  ctaDescription: z.string().trim().optional().nullable(),
  ctaButtonText: z.string().trim().min(1).default("تصفح المتجر"),
  aboutTitle: z.string().trim().optional().nullable(),
  aboutContent: z.string().trim().optional().nullable(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "رمز القسيمة مطلوب")
    .transform((v) => v.toUpperCase()),
  description: z.string().trim().optional().nullable(),
  discountType: z.enum(["PERCENT", "FIXED"]).default("PERCENT"),
  discountValue: z.coerce.number().positive("قيمة الخصم يجب أن تكون أكبر من صفر"),
  minOrder: z.coerce.number().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const inventoryAdjustSchema = z.object({
  productId: z.string().min(1, "معرف المنتج مطلوب"),
  stock: z.coerce.number().int().min(0, "المخزون لا يمكن أن يكون سالباً"),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  email: z
    .string()
    .trim()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صالح")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]).default("STAFF"),
  isActive: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type HomeContentInput = z.infer<typeof homeContentSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
