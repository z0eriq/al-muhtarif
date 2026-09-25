import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import type { HomeContentData } from "@/services/settings.service";

type CtaSectionProps = {
  content: Pick<
    HomeContentData,
    "ctaTitle" | "ctaDescription" | "ctaButtonText"
  >;
};

export function CtaSection({ content }: CtaSectionProps) {
  return (
    <section className="pb-16 pt-4 md:pb-20">
      <div className="container-store">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-primary via-accent to-accent-2 px-6 py-12 text-center text-white shadow-brand md:px-12 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 80%, rgba(255,255,255,0.25), transparent 35%)",
              }}
            />
            <div className="relative mx-auto max-w-2xl space-y-4">
              <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold md:text-4xl">
                {content.ctaTitle}
              </h2>
              {content.ctaDescription ? (
                <p className="text-sm leading-7 text-white/85 md:text-base">
                  {content.ctaDescription}
                </p>
              ) : null}
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary-light"
              >
                {content.ctaButtonText}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
