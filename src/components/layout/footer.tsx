import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS, SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import type { StoreSettings } from "@/services/settings.service";

type FooterProps = {
  settings?: Partial<StoreSettings>;
};

export function Footer({ settings }: FooterProps) {
  const storeNameAr = settings?.storeNameAr ?? STORE.nameAr;
  const storeNameEn = settings?.storeNameEn ?? STORE.nameEn;
  const email = settings?.email ?? STORE.email;
  const phone = settings?.phone ?? STORE.phone;
  const address = settings?.address ?? STORE.address;
  const workingHours = settings?.workingHours ?? STORE.workingHours;
  const facebookUrl = settings?.facebookUrl ?? SOCIAL_DEFAULTS.facebookUrl;
  const instagramUrl = settings?.instagramUrl ?? SOCIAL_DEFAULTS.instagramUrl;
  const mapsUrl = settings?.googleMapsUrl ?? STORE.mapsShareUrl;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-[#1a0f2e] text-white">
      <div className="container-store grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <BrandLogo
            src={settings?.logo ?? STORE.logo}
            storeNameAr={storeNameAr}
            storeNameEn={storeNameEn}
            size="lg"
            inverted
          />
          <p className="text-sm leading-relaxed text-white/70">
            متجر تقني موثوق في الحلة – بابل. أجهزة أصلية، أسعار واضحة، وخدمة قريبة منك.
          </p>
          <div className="flex gap-2">
            {facebookUrl ? (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-primary"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            ) : null}
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-primary"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-[family-name:var(--font-tajawal)] text-lg font-bold">
            روابط سريعة
          </h3>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop?onSale=1"
                className="text-sm text-white/70 transition hover:text-white"
              >
                العروض
              </Link>
            </li>
            <li>
              <Link
                href="/wishlist"
                className="text-sm text-white/70 transition hover:text-white"
              >
                المفضلة
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <h3 className="mb-4 font-[family-name:var(--font-tajawal)] text-lg font-bold">
            تواصل معنا
          </h3>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {address}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-accent-2" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white" dir="ltr">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-accent-2" />
              <a href={`mailto:${email}`} className="hover:text-white" dir="ltr">
                {email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" />
              <span>{workingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-store flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {storeNameAr} ({storeNameEn}). جميع الحقوق محفوظة.
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80"
          >
            العراق – بابل – الحلة – شارع 40
          </a>
        </div>
      </div>
    </footer>
  );
}
