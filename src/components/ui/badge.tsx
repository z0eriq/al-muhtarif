import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary-light text-primary",
        success: "bg-emerald-50 text-success",
        warning: "bg-amber-50 text-warning",
        danger: "bg-red-50 text-danger",
        muted: "bg-primary-soft text-muted",
        sale: "bg-danger text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
