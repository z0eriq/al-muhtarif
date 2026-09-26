import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import {
  JsonLd,
  organizationJsonLd,
  buildTwitterMetadata,
} from "@/components/seo/json-ld";
import { STORE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import { getSettings } from "@/services/settings.service";
import "./globals.css";

export const dynamic = "force-dynamic";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title =
    settings.seoTitle ?? `${settings.storeNameAr} | ${settings.storeNameEn}`;
  const description =
    settings.seoDescription ??
    "متجر المحترف للأجهزة والإلكترونيات في الحلة – بابل.";

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: {
      default: title,
      template: `%s | ${settings.storeNameAr}`,
    },
    description,
    icons: {
      icon: [{ url: settings.favicon || "/logo-icon.png", type: "image/png" }],
      apple: settings.favicon || "/logo-icon.png",
    },
    openGraph: {
      title: settings.storeNameAr,
      description,
      locale: "ar_IQ",
      siteName: settings.storeNameEn,
      type: "website",
      url: absoluteUrl("/"),
      images: [{ url: absoluteUrl(settings.logo || STORE.logo) }],
    },
    twitter: buildTwitterMetadata({
      title: settings.storeNameAr,
      description,
      image: settings.logo || STORE.logo,
    }),
    alternates: {
      canonical: absoluteUrl("/"),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={organizationJsonLd(settings)} />
        <AppProviders>
          {children}
          <WhatsAppFloat phone={settings.whatsapp} />
        </AppProviders>
      </body>
    </html>
  );
}
