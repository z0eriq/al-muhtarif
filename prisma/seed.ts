import { hash } from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function svgPlaceholder(
  label: string,
  options?: { bg?: string; fg?: string; width?: number; height?: number },
): string {
  const width = options?.width ?? 800;
  const height = options?.height ?? 800;
  const bg = options?.bg ?? "#5B21B6";
  const fg = options?.fg ?? "#FFFFFF";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <circle cx="${width / 2}" cy="${height / 2 - 40}" r="72" fill="none" stroke="${fg}" stroke-width="8" opacity="0.85"/>
  <text x="50%" y="58%" text-anchor="middle" fill="${fg}" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="600">${label}</text>
  <text x="50%" y="66%" text-anchor="middle" fill="${fg}" font-family="Segoe UI, Arial, sans-serif" font-size="20" opacity="0.8">AL MUHTARIF</text>
</svg>`;
}

async function ensurePlaceholder(
  filename: string,
  label: string,
  colors?: { bg?: string; fg?: string },
): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const filePath = path.join(UPLOADS_DIR, filename);
  await writeFile(filePath, svgPlaceholder(label, colors), "utf8");
  return `/uploads/${filename}`;
}

const categoriesSeed = [
  {
    nameAr: "هواتف ذكية",
    nameEn: "Smartphones",
    slug: "smartphones",
    description: "أحدث الهواتف الذكية وإكسسواراتها.",
    sortOrder: 1,
    imageFile: "category-smartphones.svg",
    bg: "#4C1D95",
  },
  {
    nameAr: "لابتوبات",
    nameEn: "Laptops",
    slug: "laptops",
    description: "أجهزة كمبيوتر محمولة للعمل والدراسة والترفيه.",
    sortOrder: 2,
    imageFile: "category-laptops.svg",
    bg: "#5B21B6",
  },
  {
    nameAr: "إكسسوارات",
    nameEn: "Accessories",
    slug: "accessories",
    description: "إكسسوارات تقنية عملية بجودة موثوقة.",
    sortOrder: 3,
    imageFile: "category-accessories.svg",
    bg: "#6D28D9",
  },
  {
    nameAr: "أجهزة لوحية",
    nameEn: "Tablets",
    slug: "tablets",
    description: "أجهزة لوحية للاستخدام اليومي والإبداعي.",
    sortOrder: 4,
    imageFile: "category-tablets.svg",
    bg: "#7C3AED",
  },
  {
    nameAr: "صوت وسماعات",
    nameEn: "Audio",
    slug: "audio",
    description: "سماعات وأنظمة صوت واضحة وقوية.",
    sortOrder: 5,
    imageFile: "category-audio.svg",
    bg: "#8B5CF6",
  },
  {
    nameAr: "شاشات وعروض",
    nameEn: "Displays",
    slug: "displays",
    description: "شاشات ومراقب للعمل والألعاب.",
    sortOrder: 6,
    imageFile: "category-displays.svg",
    bg: "#A78BFA",
  },
] as const;

type ProductSeed = {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  descriptionAr: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  categorySlug: string;
  imageFile: string;
  bg: string;
  specifications: Record<string, string>;
};

const productsSeed: ProductSeed[] = [
  {
    nameAr: "هاتف ذكي برو 128GB",
    nameEn: "Smartphone Pro 128GB",
    slug: "smartphone-pro-128",
    sku: "AM-SP-128",
    descriptionAr:
      "هاتف ذكي بأداء سلس وكاميرا واضحة، مناسب للاستخدام اليومي والعمل.",
    price: 425000,
    compareAtPrice: 475000,
    stock: 18,
    status: "ACTIVE",
    isFeatured: true,
    isNew: true,
    tags: ["هواتف", "مميز"],
    categorySlug: "smartphones",
    imageFile: "product-smartphone-pro.svg",
    bg: "#4C1D95",
    specifications: {
      التخزين: "128GB",
      الذاكرة: "8GB",
      الشاشة: "6.5 بوصة",
    },
  },
  {
    nameAr: "هاتف اقتصادي 64GB",
    nameEn: "Budget Phone 64GB",
    slug: "budget-phone-64",
    sku: "AM-SP-064",
    descriptionAr: "خيار عملي بسعر مناسب مع بطارية تدوم طويلاً.",
    price: 185000,
    stock: 30,
    status: "ACTIVE",
    isFeatured: false,
    isNew: true,
    tags: ["هواتف"],
    categorySlug: "smartphones",
    imageFile: "product-budget-phone.svg",
    bg: "#5B21B6",
    specifications: {
      التخزين: "64GB",
      الذاكرة: "4GB",
      البطارية: "5000mAh",
    },
  },
  {
    nameAr: "لابتوب أعمال 15.6",
    nameEn: "Business Laptop 15.6",
    slug: "business-laptop-15",
    sku: "AM-LP-156",
    descriptionAr: "لابتوب خفيف للأعمال والدراسة مع لوحة مفاتيح مريحة.",
    price: 780000,
    compareAtPrice: 850000,
    stock: 10,
    status: "ACTIVE",
    isFeatured: true,
    isNew: false,
    tags: ["لابتوب", "مميز"],
    categorySlug: "laptops",
    imageFile: "product-business-laptop.svg",
    bg: "#6D28D9",
    specifications: {
      المعالج: "Core i5",
      الذاكرة: "16GB",
      التخزين: "512GB SSD",
    },
  },
  {
    nameAr: "لابتوب ألعاب RTX",
    nameEn: "Gaming Laptop RTX",
    slug: "gaming-laptop-rtx",
    sku: "AM-LP-RTX",
    descriptionAr: "جهاز قوي للألعاب والمونتاج مع شاشة عالية التحديث.",
    price: 1450000,
    stock: 6,
    status: "ACTIVE",
    isFeatured: true,
    isNew: true,
    tags: ["لابتوب", "ألعاب"],
    categorySlug: "laptops",
    imageFile: "product-gaming-laptop.svg",
    bg: "#7C3AED",
    specifications: {
      المعالج: "Core i7",
      الذاكرة: "32GB",
      الرسوميات: "RTX",
    },
  },
  {
    nameAr: "سماعة لاسلكية ANC",
    nameEn: "Wireless ANC Headphones",
    slug: "wireless-anc-headphones",
    sku: "AM-AU-ANC",
    descriptionAr: "سماعة رأس بخاصية عزل الضوضاء وصوت متوازن.",
    price: 95000,
    compareAtPrice: 120000,
    stock: 40,
    status: "ACTIVE",
    isFeatured: true,
    isNew: false,
    tags: ["صوت", "عرض"],
    categorySlug: "audio",
    imageFile: "product-anc-headphones.svg",
    bg: "#8B5CF6",
    specifications: {
      الاتصال: "Bluetooth 5.3",
      البطارية: "30 ساعة",
      العزل: "ANC",
    },
  },
  {
    nameAr: "سماعة أذن رياضية",
    nameEn: "Sport Earbuds",
    slug: "sport-earbuds",
    sku: "AM-AU-SPT",
    descriptionAr: "سماعة أذن خفيفة ومقاومة للعرق للرياضة اليومية.",
    price: 45000,
    stock: 55,
    status: "ACTIVE",
    isFeatured: false,
    isNew: true,
    tags: ["صوت"],
    categorySlug: "audio",
    imageFile: "product-sport-earbuds.svg",
    bg: "#A78BFA",
    specifications: {
      المقاومة: "IPX5",
      البطارية: "24 ساعة",
      الشحن: "USB-C",
    },
  },
  {
    nameAr: "تابلت 10.9 إنش",
    nameEn: "Tablet 10.9",
    slug: "tablet-10-9",
    sku: "AM-TB-109",
    descriptionAr: "جهاز لوحي مناسب للتصفح والدراسة ومشاهدة المحتوى.",
    price: 320000,
    stock: 14,
    status: "ACTIVE",
    isFeatured: true,
    isNew: false,
    tags: ["تابلت"],
    categorySlug: "tablets",
    imageFile: "product-tablet-109.svg",
    bg: "#4C1D95",
    specifications: {
      الشاشة: "10.9 بوصة",
      التخزين: "128GB",
      القلم: "مدعوم",
    },
  },
  {
    nameAr: "تابلت صغير 8.7",
    nameEn: "Mini Tablet 8.7",
    slug: "mini-tablet-8-7",
    sku: "AM-TB-087",
    descriptionAr: "تابلت مدمج وخفيف للتنقل والاستخدام اليومي.",
    price: 210000,
    compareAtPrice: 240000,
    stock: 20,
    status: "ACTIVE",
    isFeatured: false,
    isNew: true,
    tags: ["تابلت", "عرض"],
    categorySlug: "tablets",
    imageFile: "product-mini-tablet.svg",
    bg: "#5B21B6",
    specifications: {
      الشاشة: "8.7 بوصة",
      التخزين: "64GB",
      الشبكة: "Wi-Fi",
    },
  },
  {
    nameAr: "شاحن سريع 65W",
    nameEn: "Fast Charger 65W",
    slug: "fast-charger-65w",
    sku: "AM-AC-65W",
    descriptionAr: "شاحن سريع متعدد المنافذ مناسب للهواتف واللابتوبات.",
    price: 28000,
    stock: 80,
    status: "ACTIVE",
    isFeatured: false,
    isNew: false,
    tags: ["إكسسوارات"],
    categorySlug: "accessories",
    imageFile: "product-charger-65w.svg",
    bg: "#6D28D9",
    specifications: {
      القدرة: "65W",
      المنافذ: "USB-C + USB-A",
      الحماية: "حماية متعددة",
    },
  },
  {
    nameAr: "حافظة حماية مغناطيسية",
    nameEn: "Magnetic Protective Case",
    slug: "magnetic-protective-case",
    sku: "AM-AC-CASE",
    descriptionAr: "حافظة متينة بحماية جيدة ومظهر أنيق.",
    price: 15000,
    stock: 100,
    status: "ACTIVE",
    isFeatured: false,
    isNew: false,
    tags: ["إكسسوارات"],
    categorySlug: "accessories",
    imageFile: "product-magnetic-case.svg",
    bg: "#7C3AED",
    specifications: {
      المادة: "TPU + Polycarbonate",
      المغناطيس: "مدعوم",
      الحماية: "زوايا معززة",
    },
  },
  {
    nameAr: "شاشة مكتبية 27K",
    nameEn: "Desktop Monitor 27",
    slug: "desktop-monitor-27",
    sku: "AM-DP-27",
    descriptionAr: "شاشة 27 إنش بدقة عالية للعمل والتصميم.",
    price: 295000,
    compareAtPrice: 330000,
    stock: 12,
    status: "ACTIVE",
    isFeatured: true,
    isNew: false,
    tags: ["شاشات", "مميز"],
    categorySlug: "displays",
    imageFile: "product-monitor-27.svg",
    bg: "#8B5CF6",
    specifications: {
      الحجم: "27 بوصة",
      الدقة: "QHD",
      التحديث: "144Hz",
    },
  },
  {
    nameAr: "شاشة ألعاب 24FHD",
    nameEn: "Gaming Monitor 24",
    slug: "gaming-monitor-24",
    sku: "AM-DP-24",
    descriptionAr: "شاشة ألعاب سريعة الاستجابة بحجم مناسب للمكتب.",
    price: 210000,
    stock: 16,
    status: "ACTIVE",
    isFeatured: false,
    isNew: true,
    tags: ["شاشات", "ألعاب"],
    categorySlug: "displays",
    imageFile: "product-monitor-24.svg",
    bg: "#A78BFA",
    specifications: {
      الحجم: "24 بوصة",
      الدقة: "Full HD",
      التحديث: "165Hz",
    },
  },
];

async function main() {
  console.log("Seeding AL MUHTARIF database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.page.deleteMany();
  await prisma.homeContent.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("Admin@123456", 12);

  await prisma.user.create({
    data: {
      name: "مدير المحترف",
      email: "admin@al-muhtarif.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  await prisma.siteSettings.create({
    data: {
      id: "main",
      storeNameAr: "المحترف",
      storeNameEn: "AL MUHTARIF",
      logo: "/logo.png",
      favicon: "/logo-icon.png",
      email: "info@al-muhtraif.com",
      phone: "+964 7743571934",
      whatsapp: "+9647743571934",
      address: "العراق – بابل – الحلة – شارع 40",
      workingHours: "السبت – الخميس: 9:00 ص – 9:00 م",
      facebookUrl: "https://www.facebook.com/professionaltecnostore",
      instagramUrl: "https://www.instagram.com/pro_40st",
      seoTitle: "المحترف | AL MUHTARIF — متجر إلكتروني عراقي",
      seoDescription:
        "متجر المحترف في الحلة – شارع 40: هواتف، لابتوبات، إكسسوارات وتقنية بأسعار منافسة وخدمة موثوقة.",
      currency: "IQD",
      currencySymbol: "د.ع",
      lowStockAlert: 5,
    },
  });

  await prisma.homeContent.create({
    data: {
      id: "main",
      heroTitle: "تقنية موثوقة… بأسعار تنافسية",
      heroDescription:
        "اكتشف منتجات المحترف المختارة بعناية للهواتف، اللابتوبات، والإكسسوارات — مع خدمة محلية في بابل وطلب سهل عبر الموقع أو واتساب.",
      heroImage: await ensurePlaceholder("home-hero.svg", "المحترف", {
        bg: "#3B0764",
      }),
      heroCtaPrimary: "تسوق الآن",
      heroCtaSecondary: "تواصل معنا",
      whyUsItems: [
        {
          title: "جودة موثوقة",
          description: "نختار منتجات عملية بجودة تفحص قبل العرض.",
          icon: "shield-check",
        },
        {
          title: "أسعار منافسة",
          description: "تسعير واضح بالدينار العراقي بدون مفاجآت.",
          icon: "badge-dollar-sign",
        },
        {
          title: "خدمة عملاء",
          description: "رد سريع عبر الهاتف وواتساب لمساعدتك في الاختيار.",
          icon: "headset",
        },
        {
          title: "توصيل سريع",
          description: "تنسيق توصيل داخل العراق حسب منطقتك.",
          icon: "truck",
        },
      ],
      ctaTitle: "ابحث عن ما تحتاجه بسهولة",
      ctaDescription: "تصفح المتجر أو راسلنا على واتساب وسنساعدك مباشرة.",
      ctaButtonText: "تصفح المتجر",
      aboutTitle: "من نحن",
      aboutContent:
        "المحترف متجر تقني في العراق – بابل – الحلة – شارع 40. نوفر منتجات وأجهزة وإكسسوارات مع تركيز على الوضوح في الأسعار وسهولة الطلب وخدمة ما بعد البيع.",
    },
  });

  const categoryMap = new Map<string, string>();

  for (const category of categoriesSeed) {
    const image = await ensurePlaceholder(category.imageFile, category.nameAr, {
      bg: category.bg,
    });

    const created = await prisma.category.create({
      data: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        description: category.description,
        image,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });

    categoryMap.set(category.slug, created.id);
  }

  for (const product of productsSeed) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category: ${product.categorySlug}`);
    }

    const imageUrl = await ensurePlaceholder(product.imageFile, product.nameAr, {
      bg: product.bg,
    });

    await prisma.product.create({
      data: {
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        slug: product.slug,
        sku: product.sku,
        descriptionAr: product.descriptionAr,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        status: product.status,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        tags: product.tags,
        specifications: product.specifications,
        images: {
          create: [
            {
              url: imageUrl,
              alt: product.nameAr,
              sortOrder: 0,
            },
          ],
        },
        categories: {
          create: [{ categoryId }],
        },
      },
    });
  }

  await prisma.page.create({
    data: {
      slug: "about",
      titleAr: "من نحن",
      titleEn: "About Us",
      contentAr: [
        "المحترف (AL MUHTARIF) متجر إلكتروني وتقني يخدم العملاء من موقعه في العراق – بابل – الحلة – شارع 40.",
        "نوفّر هواتف، لابتوبات، أجهزة لوحية، إكسسوارات، ومنتجات صوت وشاشات مع عرض واضح للأسعار بالدينار العراقي وإمكانية الطلب أونلاين أو عبر واتساب.",
        "هدفنا تجربة شراء بسيطة: منتجات مختارة، تواصل سريع، وخدمة محلية يمكنك الاعتماد عليها.",
        "للتواصل: info@al-muhtraif.com — +964 7743571934",
      ].join("\n\n"),
      contentEn:
        "AL MUHTARIF is a tech store based in Hilla, Babylon, Iraq (Street 40), offering electronics and accessories with clear IQD pricing and easy WhatsApp ordering.",
      isPublished: true,
      seoTitle: "من نحن | المحترف AL MUHTARIF",
      seoDescription:
        "تعرف على متجر المحترف في الحلة – شارع 40 وكيف نساعدك في اختيار التقنية المناسبة.",
    },
  });

  console.log("Seed completed successfully.");
  console.log("Admin: admin@al-muhtarif.com / Admin@123456");
  console.log(`Categories: ${categoriesSeed.length}`);
  console.log(`Products: ${productsSeed.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
