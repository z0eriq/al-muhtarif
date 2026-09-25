import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validators";
import { canManageRole } from "@/lib/permissions";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
  zodIssues,
} from "@/lib/admin-auth";

export async function GET() {
  const authResult = await requireAuth("users:view");
  if (!authResult.ok) return authResult.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return jsonSuccess(users);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth("users:manage");
  if (!authResult.ok) return authResult.response;

  // Prefer SUPER_ADMIN for creating users; ADMIN can create lower roles only
  const actorRole = authResult.session.user.role;
  if (actorRole !== "SUPER_ADMIN" && actorRole !== "ADMIN") {
    return jsonError("ليس لديك صلاحية لإنشاء مستخدمين", 403);
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("بيانات المستخدم غير صالحة", 400, zodIssues(parsed.error));
    }

    const data = parsed.data;
    const targetRole = data.role as Role;

    if (actorRole !== "SUPER_ADMIN") {
      if (targetRole === "SUPER_ADMIN" || targetRole === "ADMIN") {
        return jsonError("يمكن للمدير الأعلى فقط إنشاء مديرين", 403);
      }
      if (!canManageRole(actorRole, targetRole)) {
        return jsonError("لا يمكنك إنشاء مستخدم بهذا الدور", 403);
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) return jsonError("البريد الإلكتروني مستخدم مسبقاً");

    const passwordHash = await hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: targetRole,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonSuccess(user, "تم إنشاء المستخدم", 201);
  } catch (error) {
    console.error("create user", error);
    return jsonError("فشل إنشاء المستخدم", 500);
  }
}
