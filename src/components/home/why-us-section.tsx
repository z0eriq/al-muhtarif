import {
  Headset,
  ShieldCheck,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import type { WhyUsItem } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  tag: Tag,
  truck: Truck,
  headset: Headset,
};

type WhyUsSectionProps = {
  items: WhyUsItem[];
};

export function WhyUsSection({ items }: WhyUsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-14 md:py-16">
      <div className="container-store">
        <Reveal>
          <div className="mb-10 text-center">
            <h2 className="font-[family-name:var(--font-tajawal)] text-2xl font-extrabold md:text-3xl">
              لماذا المحترف؟
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted md:text-base">
              نركز على الجودة، السعر الواضح، والدعم القريب منك
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon ?? ""] ?? ShieldCheck;
            return (
              <Reveal key={`${item.title}-${index}`} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-base font-bold">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
