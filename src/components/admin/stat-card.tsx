"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  format?: (n: number) => string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "accent";
  hint?: string;
  animate?: boolean;
};

const TONE_STYLES = {
  primary: "bg-primary-light text-primary",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  accent: "bg-violet-50 text-accent",
} as const;

export function StatCard({
  title,
  value,
  format = (n) => String(n),
  icon: Icon,
  tone = "primary",
  hint,
  animate = true,
}: StatCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!animate) return;

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
          {format(shown)}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      <div className={cn("rounded-2xl p-3", TONE_STYLES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
