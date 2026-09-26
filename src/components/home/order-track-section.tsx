import { PackageSearch } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { OrderTrackForm } from "@/components/home/order-track-form";

export function OrderTrackSection() {
  return (
    <section id="track-order" className="scroll-mt-28 border-b border-border bg-white py-10 md:py-12">
      <div className="container-store">
        <Reveal>
          <div className="rounded-[1.75rem] border border-primary/15 bg-gradient-to-bl from-primary-soft via-white to-white p-5 shadow-sm md:p-8">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-10">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <PackageSearch className="h-4 w-4" />
                  تتبع الطلب
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-tajawal)] text-2xl font-extrabold text-foreground md:text-3xl">
                  أين وصل طلبك؟
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-muted md:text-base">
                  أدخل رقم الطلب الظاهر بعد إتمام الشراء لمعرفة حالته فوراً.
                </p>
              </div>
              <div className="w-full md:min-w-[28rem]">
                <OrderTrackForm />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
