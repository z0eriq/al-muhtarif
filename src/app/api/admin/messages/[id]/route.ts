import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonError, jsonSuccess } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("messages:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return jsonError("الرسالة غير موجودة", 404);

    const body = (await request.json()) as { isRead?: boolean };
    const isRead = body.isRead !== false;
    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    return jsonSuccess(message, isRead ? "تم تعليم الرسالة كمقروءة" : "تم تعليم الرسالة كغير مقروءة");
  } catch (error) {
    console.error("update contact message", error);
    return jsonError("فشل تحديث الرسالة", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("messages:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return jsonError("الرسالة غير موجودة", 404);

    await prisma.contactMessage.delete({ where: { id } });
    return jsonSuccess({ id }, "تم حذف الرسالة");
  } catch (error) {
    console.error("delete contact message", error);
    return jsonError("فشل حذف الرسالة", 500);
  }
}
