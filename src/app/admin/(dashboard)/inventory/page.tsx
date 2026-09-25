import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { AdminTopbar } from "@/components/admin/topbar";
import { InventoryManager } from "@/components/admin/inventory-manager";

export const metadata = { title: "المخزون" };

export default async function AdminInventoryPage() {
  const session = await auth();
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { lowStockAlert: true },
  });
  const lowStockAlert = settings?.lowStockAlert ?? 5;

  const products = await prisma.product.findMany({
    orderBy: { stock: "asc" },
    select: {
      id: true,
      nameAr: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      status: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="المخزون"
        subtitle="مستويات المخزون والتنبيهات"
        userName={session?.user?.name ?? "المدير"}
      />
      <InventoryManager
        products={products}
        canManage={hasPermission(session?.user?.role, "inventory:manage")}
        lowStockAlert={lowStockAlert}
      />
    </div>
  );
}
