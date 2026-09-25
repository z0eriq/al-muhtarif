import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  const session = await auth();
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { nameAr: "asc" },
    select: { id: true, nameAr: true },
  });

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="منتج جديد"
        subtitle="إضافة منتج إلى الكتالوج"
        userName={session?.user?.name ?? "المدير"}
      />
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
