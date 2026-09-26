"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social";
import { Drawer } from "@/components/ui/drawer";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NAV_LINKS } from "@/lib/constants";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  storeNameAr: string;
  logo: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  whatsappUrl: string;
};

export function MobileNav({
  open,
  onClose,
  storeNameAr,
  logo,
  facebookUrl,
  instagramUrl,
  whatsappUrl,
}: MobileNavProps) {
  return (
    <Drawer open={open} onClose={onClose} title="القائمة" side="right">
      <div className="mb-6">
        <BrandLogo src={logo} storeNameAr={storeNameAr} size="lg" />
      </div>

      <nav className="flex flex-col gap-1" aria-label="قائمة الجوال">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-light hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/cart"
          onClick={onClose}
          className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-light hover:text-primary"
        >
          السلة
        </Link>
      </nav>

      <div className="mt-8 space-y-3 border-t border-border pt-6">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
          onClick={onClose}
        >
          <MessageCircle className="h-4 w-4" />
          تواصل عبر واتساب
        </a>

        <div className="flex items-center gap-2">
          {facebookUrl ? (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="فيسبوك"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
}
