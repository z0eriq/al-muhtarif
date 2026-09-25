import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { ApiError } from "@/types";

type AuthSuccess = {
  ok: true;
  session: Session;
};

type AuthFailure = {
  ok: false;
  response: NextResponse<ApiError>;
};

export async function requireAuth(
  permission?: Permission,
): Promise<AuthSuccess | AuthFailure> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      ),
    };
  }

  if (permission && !hasPermission(session.user.role, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, session };
}

export function jsonSuccess<T>(
  data: T,
  message?: string,
  status = 200,
): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message ? { message } : {}) },
    { status },
  );
}

export function jsonError(
  error: string,
  status = 400,
  issues?: Record<string, string[]>,
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error, ...(issues ? { issues } : {}) },
    { status },
  );
}

export function zodIssues(
  error: {
    issues: Array<{ path: PropertyKey[]; message: string }>;
  },
): Record<string, string[]> {
  const issues: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    if (!issues[key]) issues[key] = [];
    issues[key].push(issue.message);
  }
  return issues;
}
