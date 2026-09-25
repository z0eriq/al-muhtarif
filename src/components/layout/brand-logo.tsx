import Image from "next/image";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src?: string;
  storeNameAr?: string;
  storeNameEn?: string;
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  inverted?: boolean;
  className?: string;
};

const SIZE = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
} as const;

export function BrandLogo({
  src = STORE.logo,
  storeNameAr = STORE.nameAr,
  storeNameEn = STORE.nameEn,
  href = "/",
  size = "md",
  showWordmark = true,
  inverted = false,
  className,
}: BrandLogoProps) {
  const mark = (
    <Image
      src={src}
      alt={`${storeNameAr} | ${storeNameEn}`}
      width={1024}
      height={1024}
      className={cn(
        "shrink-0 rounded-full object-cover ring-1 ring-black/10",
        SIZE[size],
      )}
      priority
      unoptimized
    />
  );

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark}
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-tight">
          <span
            className={cn(
              "font-[family-name:var(--font-tajawal)] text-lg font-extrabold md:text-xl",
              inverted ? "text-white" : "text-primary",
            )}
          >
            {storeNameAr}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold tracking-[0.18em]",
              inverted ? "text-white/70" : "text-muted",
            )}
          >
            FOR COMPUTERS
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={`${storeNameAr} | ${storeNameEn}`}>
      {content}
    </Link>
  );
}
