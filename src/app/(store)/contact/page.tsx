import { FacebookIcon, InstagramIcon } from "@/components/icons/social";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { SOCIAL_DEFAULTS } from "@/lib/constants";
import { getSettings } from "@/services/settings.service";

export async function generateMetadata() {
  return {
    title: "تواصل معنا",
    description: "تواصل مع متجر المحترف في الحلة – بابل",
  };
}

export default async function ContactPage() {
  const settings = await getSettings();
  const facebookUrl = settings.facebookUrl ?? SOCIAL_DEFAULTS.facebookUrl;
  const instagramUrl = settings.instagramUrl ?? SOCIAL_DEFAULTS.instagramUrl;

  const mapEmbed =
    settings.googleMapsEmbed ??
    "https://www.google.com/maps?q=%D8%A7%D9%84%D8%AD%D9%84%D8%A9+%D8%A8%D8%A7%D8%A8%D9%84+%D8%B4%D8%A7%D8%B1%D8%B9+40&output=embed";

  return (
    <div className="container-store py-8 md:py-10">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-tajawal)] text-3xl font-extrabold">
          تواصل معنا
        </h1>
        <p className="mt-2 text-sm text-muted">
          نسعد بخدمتك عبر النموذج أو وسائل التواصل
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-bold">أرسل رسالة</h2>
          <ContactForm />
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <a href={`mailto:${settings.email}`} dir="ltr">
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <span>{settings.workingHours}</span>
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="فيسبوك"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              ) : null}
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="إنستغرام"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <iframe
              title="موقع المحترف على الخريطة"
              src={mapEmbed}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
