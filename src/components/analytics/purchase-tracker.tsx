"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/components/analytics/track-meta";

type PurchaseTrackerProps = {
  orderNumber: string;
  value: number;
  items: Array<{ productId: string | null; quantity: number; price: number }>;
};

export function PurchaseTracker({
  orderNumber,
  value,
  items,
}: PurchaseTrackerProps) {
  useEffect(() => {
    const key = `meta-purchase-${orderNumber}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const contents = items
      .filter((item) => item.productId)
      .map((item) => ({
        id: item.productId as string,
        quantity: item.quantity,
        item_price: item.price,
      }));

    trackMetaEvent(
      "Purchase",
      {
        currency: "IQD",
        value,
        order_id: orderNumber,
        content_type: "product",
        content_ids: contents.map((item) => item.id),
        contents,
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      },
      { eventId: orderNumber, sendToCapi: false },
    );
  }, [items, orderNumber, value]);

  return null;
}
