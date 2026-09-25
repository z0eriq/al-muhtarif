import type { MetadataRoute } from "next";
import { STORE } from "@/lib/constants";
import { listActiveCategories } from "@/services/categories.service";
import { getAllActiveProductSlugs } from "@/services/products.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `https://${STORE.domain}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/categories",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      getAllActiveProductSlugs(),
      listActiveCategories(),
    ]);

    productEntries = products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    categoryEntries = categories.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // DB may be unavailable during build — static routes still emit
  }

  return [...staticRoutes, ...categoryEntries, ...productEntries];
}
