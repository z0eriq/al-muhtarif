import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SOCIAL_DEFAULTS, STORE } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "الإعدادات" };

export default async function AdminSettingsPage() {
  const session = await auth();
  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        id: "main",
        storeNameAr: STORE.nameAr,
        storeNameEn: STORE.nameEn,
        email: STORE.email,
        phone: STORE.phone,
        whatsapp: STORE.whatsapp,
        address: STORE.address,
        workingHours: STORE.workingHours,
        facebookUrl: SOCIAL_DEFAULTS.facebookUrl,
        instagramUrl: SOCIAL_DEFAULTS.instagramUrl,
      },
    });
  }

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="الإعدادات"
        subtitle="إعدادات المتجر والتواصل"
        userName={session?.user?.name ?? "المدير"}
      />
      <SettingsForm
        initial={{
          storeNameAr: settings.storeNameAr,
          storeNameEn: settings.storeNameEn,
          logo: settings.logo,
          favicon: settings.favicon,
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          address: settings.address,
          workingHours: settings.workingHours,
          facebookUrl: settings.facebookUrl,
          instagramUrl: settings.instagramUrl,
          twitterUrl: settings.twitterUrl,
          youtubeUrl: settings.youtubeUrl,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          googleMapsEmbed: settings.googleMapsEmbed,
          googleMapsUrl: settings.googleMapsUrl,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
          lowStockAlert: settings.lowStockAlert,
        }}
      />
    </div>
  );
}
