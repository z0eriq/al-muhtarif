import { Suspense } from "react";
import { Cairo, Tajawal } from "next/font/google";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LoginForm } from "@/components/admin/login-form";

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
  title: "تسجيل الدخول | لوحة المحترف",
  description: "دخول لوحة تحكم متجر المحترف",
};

export default function AdminLoginPage() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`${cairo.variable} ${tajawal.variable} min-h-screen bg-[radial-gradient(ellipse_at_top,_#7c3aed_0%,_#4c1d95_45%,_#1e0a3c_100%)] font-sans`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-violet-300/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur">
          <div className="bg-[#111] px-6 py-8">
            <BrandLogo
              src="/logo.png"
              size="xl"
              showWordmark
              inverted
              className="justify-center"
            />
            <p className="mt-4 text-center text-sm text-white/70">لوحة التحكم الإدارية</p>
          </div>

          <div className="space-y-6 px-6 py-8">
            <div>
              <h2 className="text-lg font-bold text-foreground">مرحباً بعودتك</h2>
              <p className="mt-1 text-sm text-muted">سجّل الدخول لإدارة المتجر</p>
            </div>

            <Suspense fallback={<div className="skeleton h-48 w-full" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
