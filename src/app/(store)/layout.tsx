import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { getSettings } from "@/services/settings.service";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <>
      <MetaPixel />
      <Header
        storeNameAr={settings.storeNameAr}
        logo={settings.logo}
        whatsapp={settings.whatsapp}
        facebookUrl={settings.facebookUrl}
        instagramUrl={settings.instagramUrl}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
