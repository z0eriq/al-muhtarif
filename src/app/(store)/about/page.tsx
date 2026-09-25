import { getHomeContent, getPageBySlug, getSettings } from "@/services/settings.service";

export async function generateMetadata() {
  return {
    title: "من نحن",
    description: "تعرّف على متجر المحترف في الحلة – بابل",
  };
}

export default async function AboutPage() {
  const [settings, home, page] = await Promise.all([
    getSettings(),
    getHomeContent(),
    getPageBySlug("about"),
  ]);

  const title = page?.titleAr ?? home.aboutTitle ?? "من نحن";
  const content =
    page?.contentAr ??
    home.aboutContent ??
    `${settings.storeNameAr} متجر تقني في ${settings.address} يقدّم أجهزة وإلكترونيات أصلية مع خدمة عملاء قريبة منك.`;

  return (
    <div className="container-store py-10 md:py-14">
      <article className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold md:text-4xl">
          {title}
        </h1>
        <div className="mt-6 space-y-4 leading-8 text-muted whitespace-pre-line">
          {content}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-foreground">معلومات التواصل</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>{settings.address}</li>
            <li dir="ltr">{settings.phone}</li>
            <li dir="ltr">{settings.email}</li>
            <li>{settings.workingHours}</li>
          </ul>
        </div>
      </article>
    </div>
  );
}
