import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { ProductGrid } from "@/components/products/product-grid";
import {
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
  buildTwitterMetadata,
} from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/utils";
import {
  getProductBySlug,
  getRelated,
} from "@/services/products.service";
import { getSettings } from "@/services/settings.service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };

  const image = product.images[0]?.url;
  const description = product.descriptionAr ?? undefined;

  return {
    title: product.nameAr,
    description,
    openGraph: {
      title: product.nameAr,
      description,
      type: "website",
      url: absoluteUrl(`/product/${product.slug}`),
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
    },
    twitter: buildTwitterMetadata({
      title: product.nameAr,
      description,
      image,
    }),
    alternates: {
      canonical: absoluteUrl(`/product/${product.slug}`),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ]);

  if (!product) notFound();

  const related = await getRelated(
    product.id,
    product.categories.map((c) => c.id),
    4,
  );

  return (
    <div className="container-store py-8 md:py-10">
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "الرئيسية", url: "/" },
            { name: "المتجر", url: "/shop" },
            { name: product.nameAr, url: `/product/${product.slug}` },
          ]),
        ]}
      />

      <nav className="mb-6 text-sm text-muted" aria-label="مسار التنقل">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-primary">
              المتجر
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-foreground">{product.nameAr}</li>
        </ol>
      </nav>

      <ProductDetailClient
        product={product}
        whatsapp={settings.whatsapp}
        currencySymbol={settings.currencySymbol}
      />

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 font-[family-name:var(--font-tajawal)] text-2xl font-extrabold">
            منتجات ذات صلة
          </h2>
          <ProductGrid
            products={related}
            currencySymbol={settings.currencySymbol}
          />
        </section>
      ) : null}
    </div>
  );
}
