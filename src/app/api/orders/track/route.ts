import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/admin-auth";
import { normalizeOrderNumber } from "@/lib/order-stock";

export async function GET(request: NextRequest) {
  const number = normalizeOrderNumber(
    request.nextUrl.searchParams.get("number") ?? "",
  );
  if (!number) {
    return jsonError("أدخل رقم الطلب");
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: number },
    select: { orderNumber: true },
  });

  if (!order) {
    return jsonError("لم نجد طلباً بهذا الرقم", 404);
  }

  return jsonSuccess({ orderNumber: order.orderNumber });
}
