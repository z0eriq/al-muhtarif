import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { jsonError, jsonSuccess } from "@/lib/admin-auth";
import {
  getClientIp,
  readRequestCookie,
  sendMetaCapiEvent,
} from "@/lib/meta-capi";

const RATE_WINDOW_MS = 2 * 60 * 1000;
const RATE_MAX = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    }

    const input = parsed.data;
    const phone = input.phone.trim();
    const email = input.email?.trim() ? input.email.trim() : null;
    const eventId = randomUUID();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.al-muhtarif.com").replace(
      /\/$/,
      "",
    );

    const recentCount = await prisma.contactMessage.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
      },
    });
    if (recentCount >= RATE_MAX) {
      return jsonError("يرجى الانتظار قليلاً قبل إرسال رسالة أخرى", 429);
    }

    await prisma.contactMessage.create({
      data: {
        name: input.name,
        phone,
        email,
        message: input.message,
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    });

    void sendMetaCapiEvent({
      eventName: "Lead",
      eventId,
      eventSourceUrl: input.eventSourceUrl ?? `${appUrl}/contact`,
      user: {
        email,
        phone,
        name: input.name,
        clientIp: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
        fbp: input.fbp ?? readRequestCookie(request, "_fbp"),
        fbc: input.fbc ?? readRequestCookie(request, "_fbc"),
        externalId: phone,
      },
    }).catch((error) => {
      console.error("[meta-capi] lead failed", error);
    });

    return jsonSuccess({ eventId }, "تم استلام رسالتك وسنتواصل معك قريباً");
  } catch (error) {
    console.error("[contact] POST failed", error);
    return jsonError("تعذر إرسال الرسالة", 500);
  }
}
