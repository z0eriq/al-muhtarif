import Link from "next/link";
import { STORE } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="container-store flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold text-primary">{STORE.nameAr}</p>
      <h1 className="mt-3 font-[family-name:var(--font-tajawal)] text-4xl font-extrabold md:text-5xl">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">
        عذراً، لم نعثر على الصفحة التي تبحث عنها. قد يكون الرابط قديماً أو غير
        صحيح.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          العودة للرئيسية
        </Link>
        <Link href="/shop" className="btn-secondary">
          تصفح المتجر
        </Link>
      </div>
    </div>
  );
}
