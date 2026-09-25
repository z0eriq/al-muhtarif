"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { NAV_LINKS, SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeNameAr?: string;
  logo?: string;
  whatsapp?: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
};

export function Header({
  storeNameAr = STORE.nameAr,
  logo = STORE.logo,
  whatsapp = STORE.whatsapp,
  facebookUrl = SOCIAL_DEFAULTS.facebookUrl,
  instagramUrl = SOCIAL_DEFAULTS.instagramUrl,
}: HeaderProps) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const waUrl = buildWhatsAppUrl(whatsapp, generalInquiryMessage());

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md">
        <div className="container-store flex h-[4.25rem] items-center justify-between gap-3 md:h-[4.75rem]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="فتح القائمة"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <BrandLogo src={logo} storeNameAr={storeNameAr} size="md" />
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="القائمة الرئيسية">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-primary-light hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="بحث"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link
              href="/wishlist"
              aria-label="المفضلة"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/80 transition hover:bg-primary-soft hover:text-primary"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -top-0.5 -start-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/admin/login"
              aria-label="حساب الإدارة"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/80 transition hover:bg-primary-soft hover:text-primary"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              aria-label="سلة المشتريات"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/80 transition hover:bg-primary-soft hover:text-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -top-0.5 -start-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1ebe57] sm:inline-flex"
            >
              واتساب
            </a>
          </div>
        </div>

        <div
          className={cn(
            "border-t border-border bg-white transition-all",
            searchOpen ? "block" : "hidden",
          )}
        >
          <form action="/shop" className="container-store py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                type="search"
                placeholder="ابحث عن منتج..."
                className="h-11 w-full rounded-xl border border-border bg-background pe-4 ps-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus={searchOpen}
              />
            </div>
          </form>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        storeNameAr={storeNameAr}
        logo={logo}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        whatsappUrl={waUrl}
      />
    </>
  );
}
