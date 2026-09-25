import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { AdminTopbar } from "@/components/admin/topbar";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const metadata = { title: "القسائم" };

export default async function AdminCouponsPage() {
  const session = await auth();
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="القسائم"
        subtitle="إدارة أكواد الخصم"
        userName={session?.user?.name ?? "المدير"}
      />
      <CouponsManager
        coupons={coupons.map((c) => ({
          ...c,
          discountValue: Number(c.discountValue),
          minOrder: c.minOrder == null ? null : Number(c.minOrder),
        }))}
        canManage={hasPermission(session?.user?.role, "coupons:manage")}
      />
    </div>
  );
}
