import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";

export async function GET() {
  const authResult = await requireAuth("categories:view");
  if (!authResult.ok) return authResult.response;

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    include: {
      parent: { select: { id: true, nameAr: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return jsonSuccess(categories);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth("categories:manage");
  if (!authResult.ok) return authResult.response;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات التصنيف غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const slugTaken = await prisma.category.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugTaken) return jsonError("الرابط المختصر مستخدم مسبقاً");

    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
        select: { id: true },
      });
      if (!parent) return jsonError("التصنيف الأب غير موجود");
    }

    const category = await prisma.category.create({
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

    return jsonSuccess(category, "تم إنشاء التصنيف", 201);
  } catch (error) {
    console.error("create category", error);
    return jsonError("فشل إنشاء التصنيف", 500);
  }
}
