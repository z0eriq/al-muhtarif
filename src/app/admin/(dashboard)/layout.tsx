import { redirect } from "next/navigation";
import { Cairo, Tajawal } from "next/font/google";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { prisma } from "@/lib/prisma";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata = {
  title: {
    default: "لوحة التحكم | المحترف",
    template: "%s | لوحة المحترف",
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { storeNameAr: true },
  });

  return (
    <div
      dir="rtl"
      lang="ar"
      className={`${cairo.variable} ${tajawal.variable} min-h-screen bg-[#f6f2fa] font-sans text-foreground`}
    >
      <div className="flex min-h-screen">
        <AdminSidebar
          role={session.user.role}
          storeName={settings?.storeNameAr ?? "المحترف"}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <Toaster richColors position="top-center" dir="rtl" />
    </div>
  );
}
