import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { homeContentSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function GET() {
  const authResult = await requireAuth("content:view");
  if (!authResult.ok) return authResult.response;

  let content = await prisma.homeContent.findUnique({ where: { id: "main" } });
  if (!content) {
    content = await prisma.homeContent.create({
      data: {
        id: "main",
        heroTitle: "مرحباً بكم في المحترف",
        heroDescription: "متجركم الموثوق للتقنية والإلكترونيات",
        whyUsItems: [
          {
            title: "جودة موثوقة",
            description: "منتجات أصلية بضمان",
            icon: "shield",
          },
        ],
        ctaTitle: "ابدأ التسوق الآن",
        ctaDescription: "اكتشف أحدث المنتجات",
      },
    });
  }

  return jsonSuccess(content);
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth("content:manage");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = homeContentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات المحتوى غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const content = await prisma.homeContent.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        ...data,
        whyUsItems: data.whyUsItems,
      },
      update: {
        ...data,
        whyUsItems: data.whyUsItems,
      },
    });

    revalidateStorefront();
    return jsonSuccess(content, "تم حفظ المحتوى");
  } catch (error) {
    console.error("update content", error);
    return jsonError("فشل حفظ المحتوى", 500);
  }
}
