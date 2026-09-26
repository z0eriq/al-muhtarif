import { CreditCard } from "lucide-react";
import { productInstallmentUrl } from "@/lib/installment";
import { cn } from "@/lib/utils";

type InstallmentLinkProps = {
  installmentAvailable?: boolean | null;
  installmentUrl?: string | null;
  className?: string;
  compact?: boolean;
};

export function InstallmentLink({
  installmentAvailable,
  installmentUrl,
  className,
  compact = false,
}: InstallmentLinkProps) {
  const href = productInstallmentUrl({
    installmentAvailable,
    installmentUrl,
  });
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold transition hover:opacity-90",
        compact
          ? "rounded-lg bg-primary-light px-2.5 py-1 text-xs text-primary"
          : "h-11 rounded-xl bg-primary px-5 text-sm text-white hover:bg-primary-hover",
        className,
      )}
    >
      <CreditCard className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {compact ? "تقسيط" : "تقسيط عبر كي كارد"}
    </a>
  );
}
