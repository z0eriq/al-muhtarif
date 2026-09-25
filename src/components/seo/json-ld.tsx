import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd(settings?: {
  storeNameAr?: string;
  storeNameEn?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const name = settings?.storeNameAr ?? STORE.nameAr;
  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    alternateName: settings?.storeNameEn ?? STORE.nameEn,
    url: absoluteUrl("/"),
    logo: absoluteUrl(settings?.logo ?? STORE.logo),
    email: settings?.email ?? STORE.email,
    telephone: settings?.phone ?? STORE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address ?? STORE.address,
      addressLocality: "الحلة",
      addressRegion: "بابل",
      addressCountry: "IQ",
    },
    sameAs,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function productJsonLd(product: {
  nameAr: string;
  descriptionAr?: string | null;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: { url: string }[];
  sku?: string | null;
}) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = product.images.map((img) => absoluteUrl(img.url));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    description: product.descriptionAr ?? undefined,
    sku: product.sku ?? undefined,
    image: images.length ? images : [absoluteUrl(STORE.logo)],
    url,
    brand: {
      "@type": "Brand",
      name: STORE.nameAr,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "IQD",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: STORE.nameAr,
      },
    },
  };
}

export function buildTwitterMetadata(options: {
  title: string;
  description?: string | null;
  image?: string | null;
}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: options.title,
    description: options.description ?? undefined,
    images: options.image ? [absoluteUrl(options.image)] : undefined,
  };
}
