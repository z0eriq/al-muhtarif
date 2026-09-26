import { SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = `964${digits.slice(1)}`;
  }
  return digits;
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

export function contactReplyMessage(name: string): string {
  return `مرحباً ${name}، تم استلام رسالتك عبر موقع ${STORE.nameAr}.`;
}

export const DEFAULT_WHATSAPP_URL = buildWhatsAppUrl(
  STORE.whatsapp,
  generalInquiryMessage(),
);

export const STORE_SOCIAL = {
  ...SOCIAL_DEFAULTS,
  whatsappUrl: DEFAULT_WHATSAPP_URL,
} as const;
