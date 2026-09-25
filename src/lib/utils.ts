import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string | null | undefined,
  options?: { currencySymbol?: string; locale?: string },
): string {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) {
    return `0 ${options?.currencySymbol ?? "د.ع"}`;
  }

  const formatted = new Intl.NumberFormat(options?.locale ?? "ar-IQ", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(value));

  return `${formatted} ${options?.currencySymbol ?? "د.ع"}`;
}

export function absoluteUrl(path = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createSlug(text: string): string {
  const base = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: "ar",
  });

  if (base.length > 0) return base;

  return `item-${Date.now().toString(36)}`;
}
