"use client";

import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

type WhatsAppFloatProps = {
  phone?: string;
};

export function WhatsAppFloat({ phone = STORE.whatsapp }: WhatsAppFloatProps) {
  const href = buildWhatsAppUrl(phone, generalInquiryMessage());

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 start-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
