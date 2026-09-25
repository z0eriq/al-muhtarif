import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getClientIp,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

const bodySchema = z.object({
  eventName: z.enum([
    "PageView",
    "ViewContent",
    "AddToCart",
    "InitiateCheckout",
  ]),
  eventId: z.string().min(8).max(128),
  eventSourceUrl: z.string().url().max(2048),
  fbp: z.string().max(256).optional().nullable(),
  fbc: z.string().max(512).optional().nullable(),
  customData: z
    .object({
      currency: z.string().max(8).optional(),
      value: z.number().nonnegative().optional(),
      content_name: z.string().max(256).optional(),
      content_ids: z.array(z.string().max(128)).max(50).optional(),
      content_type: z.string().max(64).optional(),
      contents: z
        .array(
          z.object({
            id: z.string().max(128),
            quantity: z.number().int().positive(),
            item_price: z.number().nonnegative().optional(),
          }),
        )
        .max(50)
        .optional(),
      num_items: z.number().int().nonnegative().optional(),
      order_id: z.string().max(128).optional(),
    })
    .optional(),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit = 40, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const input = parsed.data;
    await sendMetaCapiEvent({
      eventName: input.eventName,
      eventId: input.eventId,
      eventSourceUrl: input.eventSourceUrl,
      customData: input.customData,
      user: {
        clientIp: ip,
        userAgent: request.headers.get("user-agent"),
        fbp: input.fbp,
        fbc: input.fbc,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[meta-capi] route failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
