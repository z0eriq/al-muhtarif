import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { AdminTopbar } from "@/components/admin/topbar";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata = { title: "المستخدمون" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const role = session?.user?.role ?? "STAFF";

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="المستخدمون"
        subtitle="إدارة صلاحيات فريق العمل"
        userName={session?.user?.name ?? "المدير"}
      />
      <UsersManager
        users={users}
        canCreate={
          hasPermission(role, "users:manage") &&
          (role === "SUPER_ADMIN" || role === "ADMIN")
        }
        actorRole={role}
      />
    </div>
  );
}
