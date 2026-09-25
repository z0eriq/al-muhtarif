"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  size?: "sm" | "md";
};

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  className,
  size = "md",
}: QuantitySelectorProps) {
  const btnSize = size === "sm" ? "icon" : "icon";
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-white p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={btnSize}
        className={dim}
        aria-label="تقليل الكمية"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className={cn(
          "min-w-10 text-center font-bold tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={btnSize}
        className={dim}
        aria-label="زيادة الكمية"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
