import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { AdminTopbar } from "@/components/admin/topbar";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata = { title: "التصنيفات" };

export default async function AdminCategoriesPage() {
  const session = await auth();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    include: {
      parent: { select: { id: true, nameAr: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="التصنيفات"
        subtitle="إدارة التصنيفات والفرعيات"
        userName={session?.user?.name ?? "المدير"}
      />
      <CategoriesManager
        categories={categories}
        canManage={hasPermission(session?.user?.role, "categories:manage")}
      />
    </div>
  );
}
