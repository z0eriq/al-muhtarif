"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShoppingBag, MapPin, Wallet } from "lucide-react";
import type { HomeContentData } from "@/services/settings.service";

type HeroSectionProps = {
  content: HomeContentData;
  storeNameAr: string;
};

function isPlaceholderHero(src: string | null | undefined) {
  if (!src) return true;
  return src.includes("home-hero.svg");
}

export function HeroSection({ content, storeNameAr }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const customImage = content.heroImage;
  const useBrandVisual = isPlaceholderHero(customImage);

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-bl from-primary-soft via-background to-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(147,51,234,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(107,33,168,0.12), transparent 35%)",
        }}
      />

      <div className="container-store relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:gap-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 space-y-6 md:order-1"
        >
          <p className="text-sm font-semibold tracking-wide text-primary">
            {storeNameAr} · FOR COMPUTERS
          </p>
          <h1 className="font-[family-name:var(--font-tajawal)] text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-[3.25rem]">
            {content.heroTitle}
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted md:text-lg">
            {content.heroDescription}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              <ShoppingBag className="h-4 w-4" />
              {content.heroCtaPrimary}
            </Link>
            <Link href="/contact" className="btn-secondary">
              {content.heroCtaSecondary}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 md:order-2"
        >
          {useBrandVisual ? (
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-6 rounded-[2.25rem] bg-[radial-gradient(circle_at_center,_rgba(245,166,35,0.28),_transparent_62%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-black/40 bg-[#0b0b0b] shadow-brand">
                <div className="relative flex aspect-square items-center justify-center p-8 sm:aspect-[4/3] sm:p-10">
                  <div className="pointer-events-none absolute inset-0 opacity-40">
                    <div className="absolute -right-16 -top-10 h-48 w-48 rounded-full border border-[#F5A623]/30" />
                    <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full border border-white/10" />
                  </div>
                  <Image
                    src="/logo.png"
                    alt={`${storeNameAr} FOR COMPUTERS`}
                    width={1024}
                    height={1024}
                    priority
                    unoptimized
                    className="relative z-10 h-56 w-56 rounded-full object-cover shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-72 sm:w-72 md:h-80 md:w-80"
                  />
                </div>
                <div className="flex flex-wrap gap-2 border-t border-white/10 bg-black/40 px-4 py-3 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    <Wallet className="h-3.5 w-3.5" />
                    الدفع عند الاستلام
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    الحلة – شارع 40
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-border/60 bg-[#0b0b0b] shadow-brand">
              <Image
                src={customImage!}
                alt={content.heroTitle}
                fill
                priority
                unoptimized={customImage!.endsWith(".svg") || customImage!.endsWith(".png")}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4"
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
