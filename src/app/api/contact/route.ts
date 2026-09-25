import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  getClientIp,
  readRequestCookie,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صالح"),
  email: z
    .string()
    .trim()
    .email("البريد غير صالح")
    .optional()
    .or(z.literal(""))
    .nullable(),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً"),
  fbp: z.string().max(256).optional().nullable(),
  fbc: z.string().max(512).optional().nullable(),
  eventSourceUrl: z.string().url().max(2048).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const eventId = randomUUID();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.al-muhtarif.com").replace(
      /\/$/,
      "",
    );

    void sendMetaCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl: input.eventSourceUrl ?? `${appUrl}/contact`,
      user: {
        email: input.email,
        phone: input.phone,
        name: input.name,
        clientIp: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
        fbp: input.fbp ?? readRequestCookie(request, "_fbp"),
        fbc: input.fbc ?? readRequestCookie(request, "_fbc"),
        externalId: input.phone,
      },
    }).catch((error) => {
      console.error("[meta-capi] lead failed", error);
    });

    console.info("[contact]", {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      message: input.message.slice(0, 500),
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      eventId,
      message: "تم استلام رسالتك وسنتواصل معك قريباً",
    });
  } catch (error) {
    console.error("[contact] POST failed", error);
    return NextResponse.json(
      { success: false, error: "تعذر إرسال الرسالة" },
      { status: 500 },
    );
  }
}
