import type { MetadataRoute } from "next";
import { buildSitemap, sitemapBaseUrl } from "@/lib/sitemap-entries";
import { loadSitemapCatalog } from "@/services/sitemap.service";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = sitemapBaseUrl();

  try {
    const catalog = await loadSitemapCatalog();
    return buildSitemap({ base, ...catalog });
  } catch (error) {
    console.error("sitemap", error);
    return buildSitemap({ base, products: [], categories: [] });
  }
}
