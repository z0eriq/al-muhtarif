import type { MetadataRoute } from "next";
import { STORE } from "@/lib/constants";

export const SITEMAP_STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export function sitemapBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return `https://www.${STORE.domain}`;
}

export function sitemapLoc(base: string, path: string): string {
  const origin = base.replace(/\/$/, "");
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteSitemapAsset(
  base: string,
  url: string | null | undefined,
): string | undefined {
  if (!url?.trim()) return undefined;
  const value = url.trim();
  if (/^https?:\/\//i.test(value)) return value;
  return sitemapLoc(base, value);
}

export function buildSitemap(options: {
  base: string;
  now?: Date;
  products: Array<{ slug: string; updatedAt: Date; image?: string | null }>;
  categories: Array<{ slug: string; updatedAt: Date; image?: string | null }>;
}): MetadataRoute.Sitemap {
  const now = options.now ?? new Date();

  const staticEntries = SITEMAP_STATIC_ROUTES.map((route) => ({
    url: sitemapLoc(options.base, route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries = options.categories.map((category) => {
    const image = absoluteSitemapAsset(options.base, category.image);
    return {
      url: sitemapLoc(options.base, `/categories/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      ...(image ? { images: [image] } : {}),
    };
  });

  const productEntries = options.products.map((product) => {
    const image = absoluteSitemapAsset(options.base, product.image);
    return {
      url: sitemapLoc(options.base, `/product/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(image ? { images: [image] } : {}),
    };
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
