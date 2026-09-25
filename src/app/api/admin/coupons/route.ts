import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";

function serializeCoupon<
  T extends { discountValue: unknown; minOrder?: unknown },
>(coupon: T) {
  return {
    ...coupon,
    discountValue: Number(coupon.discountValue),
    minOrder: coupon.minOrder == null ? null : Number(coupon.minOrder),
  };
}

export async function GET() {
  const authResult = await requireAuth("coupons:view");
  if (!authResult.ok) return authResult.response;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return jsonSuccess(coupons.map(serializeCoupon));
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth("coupons:manage");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات القسيمة غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
      select: { id: true },
    });
    if (existing) return jsonError("رمز القسيمة مستخدم مسبقاً");

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrder: data.minOrder ?? null,
        maxUses: data.maxUses ?? null,
        isActive: data.isActive,
        startsAt: data.startsAt ?? null,
        endsAt: data.endsAt ?? null,
      },
    });

    return jsonSuccess(serializeCoupon(coupon), "تم إنشاء القسيمة", 201);
  } catch (error) {
    console.error("create coupon", error);
    return jsonError("فشل إنشاء القسيمة", 500);
  }
}
