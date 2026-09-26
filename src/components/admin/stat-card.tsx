"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Mail,
  Package,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const ICONS = {
  sales: DollarSign,
  orders: ShoppingBag,
  newOrders: Sparkles,
  products: Package,
  lowStock: AlertTriangle,
  customers: Users,
  messages: Mail,
} as const;

const TONE_STYLES = {
  primary: "bg-primary-light text-primary",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  accent: "bg-violet-50 text-accent",
} as const;

export type StatCardIcon = keyof typeof ICONS;
export type StatCardTone = keyof typeof TONE_STYLES;

type StatCardProps = {
  title: string;
  value: number;
  formatKind?: "number" | "price";
  icon: StatCardIcon;
  tone?: StatCardTone;
  hint?: string;
  animate?: boolean;
};

function formatValue(value: number, formatKind: "number" | "price") {
  if (formatKind === "price") {
    return formatPrice(value);
  }
  return String(value);
}

export function StatCard({
  title,
  value,
  formatKind = "number",
  icon,
  tone = "primary",
  hint,
  animate = true,
}: StatCardProps) {
  const [display, setDisplay] = useState(0);
  const Icon = ICONS[icon];

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }

    const duration = 700;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, animate]);

  const shown = animate ? display : value;

  return (
    <div className="card-surface flex items-start justify-between gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{title}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {formatValue(shown, formatKind)}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      <div className={cn("rounded-2xl p-3", TONE_STYLES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
