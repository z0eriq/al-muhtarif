import { SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(
  phone: string = STORE.whatsapp,
  message?: string,
): string {
  const digits = normalizePhone(phone);
  const url = new URL(`https://wa.me/${digits}`);

  if (message?.trim()) {
    url.searchParams.set("text", message.trim());
  }

  return url.toString();
}

export function productInquiryMessage(
  productName: string,
  options?: { slug?: string; sku?: string | null },
): string {
  const lines = [
    `مرحباً، أود الاستفسار عن منتج من ${STORE.nameAr}:`,
    productName,
  ];

  if (options?.sku) {
    lines.push(`رمز المنتج: ${options.sku}`);
  }

  if (options?.slug) {
    lines.push(absoluteUrl(`/product/${options.slug}`));
  }

  return lines.join("\n");
}

export function generalInquiryMessage(): string {
  return `مرحباً، أود التواصل مع ${STORE.nameAr}.`;
}

export function orderInquiryMessage(orderNumber: string): string {
  return `مرحباً، أود الاستفسار عن الطلب رقم ${orderNumber}.`;
}

export const DEFAULT_WHATSAPP_URL = buildWhatsAppUrl(
  STORE.whatsapp,
  generalInquiryMessage(),
);

export const STORE_SOCIAL = {
  ...SOCIAL_DEFAULTS,
  whatsappUrl: DEFAULT_WHATSAPP_URL,
} as const;
