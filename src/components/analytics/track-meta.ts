"use client";

import type { MetaCustomData, MetaStandardEvent } from "@/lib/meta-events";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function trackMetaEvent(
  eventName: MetaStandardEvent,
  customData?: MetaCustomData,
  options?: { eventId?: string; sendToCapi?: boolean },
): string {
  const eventId = options?.eventId ?? crypto.randomUUID();
  const sendToCapi = options?.sendToCapi ?? true;

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, customData ?? {}, { eventID: eventId });
  }

  if (sendToCapi && eventName !== "Purchase") {
    void fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
        customData,
      }),
      keepalive: true,
    });
  }

  return eventId;
}

export function productMetaData(product: {
  id: string;
  nameAr: string;
  price: number;
  quantity?: number;
}): MetaCustomData {
  const quantity = product.quantity ?? 1;
  return {
    currency: "IQD",
    value: product.price * quantity,
    content_name: product.nameAr,
    content_ids: [product.id],
    content_type: "product",
    contents: [{ id: product.id, quantity, item_price: product.price }],
    num_items: quantity,
  };
}
