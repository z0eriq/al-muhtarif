import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { ContentForm } from "./content-form";
import type { WhyUsItem } from "@/types";

export const metadata = { title: "المحتوى" };

export default async function AdminContentPage() {
  const session = await auth();
  let content = await prisma.homeContent.findUnique({ where: { id: "main" } });

  if (!content) {
    content = await prisma.homeContent.create({
      data: {
        id: "main",
        heroTitle: "مرحباً بكم في المحترف",
        heroDescription: "متجركم الموثوق للتقنية والإلكترونيات",
        whyUsItems: [
          {
            title: "جودة موثوقة",
            description: "منتجات أصلية بضمان",
            icon: "shield",
          },
        ],
        ctaTitle: "ابدأ التسوق الآن",
        ctaDescription: "اكتشف أحدث المنتجات",
      },
    });
  }

  const whyUsItems = Array.isArray(content.whyUsItems)
    ? (content.whyUsItems as WhyUsItem[])
    : [];

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="المحتوى"
        subtitle="تحرير محتوى الصفحة الرئيسية"
        userName={session?.user?.name ?? "المدير"}
      />
      <ContentForm
        initial={{
          heroTitle: content.heroTitle,
          heroDescription: content.heroDescription,
          heroImage: content.heroImage,
          heroCtaPrimary: content.heroCtaPrimary,
          heroCtaSecondary: content.heroCtaSecondary,
          whyUsItems,
          ctaTitle: content.ctaTitle,
          ctaDescription: content.ctaDescription,
          ctaButtonText: content.ctaButtonText,
          aboutTitle: content.aboutTitle,
          aboutContent: content.aboutContent,
        }}
      />
    </div>
  );
}
