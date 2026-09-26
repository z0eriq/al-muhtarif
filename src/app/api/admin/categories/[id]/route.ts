import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("categories:view");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, nameAr: true } },
      children: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true, children: true } },
    },
  });

  if (!category) return jsonError("التصنيف غير موجود", 404);
  return jsonSuccess(category);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("categories:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return jsonError("التصنيف غير موجود", 404);

    const body = await request.json();

    if (
      body &&
      typeof body === "object" &&
      Object.keys(body).length === 1 &&
      "isActive" in body
    ) {
      const updated = await prisma.category.update({
        where: { id },
        data: { isActive: Boolean(body.isActive) },
        include: {
          parent: { select: { id: true, nameAr: true } },
          _count: { select: { products: true, children: true } },
        },
      });
      revalidateStorefront([`/categories/${updated.slug}`]);
      return jsonSuccess(updated, "تم تحديث حالة التصنيف");
    }

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات التصنيف غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    if (data.parentId === id) {
      return jsonError("لا يمكن جعل التصنيف أباً لنفسه");
    }

    if (data.slug !== existing.slug) {
      const slugTaken = await prisma.category.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (slugTaken) return jsonError("الرابط المختصر مستخدم مسبقاً");
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
      include: {
        parent: { select: { id: true, nameAr: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    revalidateStorefront([`/categories/${category.slug}`]);
    return jsonSuccess(category, "تم تحديث التصنيف");
  } catch (error) {
    console.error("update category", error);
    return jsonError("فشل تحديث التصنيف", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth("categories:manage");
  if (!authResult.ok) return authResult.response;

  const { id } = await context.params;

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true, products: true } } },
    });
    if (!existing) return jsonError("التصنيف غير موجود", 404);
    if (existing._count.children > 0) {
      return jsonError("احذف التصنيفات الفرعية أولاً");
    }

    await prisma.category.delete({ where: { id } });
    revalidateStorefront(existing.slug ? [`/categories/${existing.slug}`] : []);
    return jsonSuccess({ id }, "تم حذف التصنيف");
  } catch (error) {
    console.error("delete category", error);
    return jsonError("فشل حذف التصنيف", 500);
  }
}
