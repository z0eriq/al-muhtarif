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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("coupons:view");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return jsonError("القسيمة غير موجودة", 404);
  return jsonSuccess(serializeCoupon(coupon));
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("coupons:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return jsonError("القسيمة غير موجودة", 404);

    const body = await request.json();

    if (
      body &&
      typeof body === "object" &&
      Object.keys(body).length === 1 &&
      "isActive" in body
    ) {
      const updated = await prisma.coupon.update({
        where: { id },
        data: { isActive: Boolean(body.isActive) },
      });
      return jsonSuccess(serializeCoupon(updated), "تم تحديث حالة القسيمة");
    }

    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات القسيمة غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    if (data.code !== existing.code) {
      const taken = await prisma.coupon.findUnique({
        where: { code: data.code },
        select: { id: true },
      });
      if (taken) return jsonError("رمز القسيمة مستخدم مسبقاً");
    }

    const coupon = await prisma.coupon.update({
      where: { id },
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

    return jsonSuccess(serializeCoupon(coupon), "تم تحديث القسيمة");
  } catch (error) {
    console.error("update coupon", error);
    return jsonError("فشل تحديث القسيمة", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("coupons:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return jsonError("القسيمة غير موجودة", 404);

    await prisma.coupon.delete({ where: { id } });
    return jsonSuccess({ id }, "تم حذف القسيمة");
  } catch (error) {
    console.error("delete coupon", error);
    return jsonError("فشل حذف القسيمة", 500);
  }
}
