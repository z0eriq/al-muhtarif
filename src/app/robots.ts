import type { MetadataRoute } from "next";
import { sitemapBaseUrl } from "@/lib/sitemap-entries";

export default function robots(): MetadataRoute.Robots {
  const base = sitemapBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/cart",
        "/checkout",
        "/wishlist",
        "/order/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
