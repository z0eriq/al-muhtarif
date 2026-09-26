import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function GET() {
  const authResult = await requireAuth("settings:view");
  if (!authResult.ok) return authResult.response;

  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "main",
        storeNameAr: STORE.nameAr,
        storeNameEn: STORE.nameEn,
        email: STORE.email,
        phone: STORE.phone,
        whatsapp: STORE.whatsapp,
        address: STORE.address,
        workingHours: STORE.workingHours,
        facebookUrl: SOCIAL_DEFAULTS.facebookUrl,
        instagramUrl: SOCIAL_DEFAULTS.instagramUrl,
      },
    });
  }

  return jsonSuccess(settings);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth("settings:manage");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات الإعدادات غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        ...data,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
        twitterUrl: data.twitterUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        googleMapsUrl: data.googleMapsUrl || null,
      },
      update: {
        ...data,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
        twitterUrl: data.twitterUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        googleMapsUrl: data.googleMapsUrl || null,
      },
    });

    revalidateStorefront();
    return jsonSuccess(settings, "تم حفظ الإعدادات");
  } catch (error) {
    console.error("update settings", error);
    return jsonError("فشل حفظ الإعدادات", 500);
  }
}
