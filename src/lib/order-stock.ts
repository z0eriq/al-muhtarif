import type { OrderStatus } from "@prisma/client";

export function shouldCommitStock(options: {
  from: OrderStatus;
  to: OrderStatus;
  stockCommitted: boolean;
}): boolean {
  return (
    options.from === "NEW" &&
    !options.stockCommitted &&
    options.to !== "NEW" &&
    options.to !== "CANCELLED"
  );
}

export function shouldRestoreStock(options: {
  to: OrderStatus;
  stockCommitted: boolean;
}): boolean {
  return options.stockCommitted && options.to === "CANCELLED";
}

export function shouldDeleteOrder(to: OrderStatus): boolean {
  return to === "CANCELLED";
}

export function normalizeOrderNumber(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  if (/^AM-[0-9A-Z]{8}$/.test(cleaned)) return cleaned;
  if (/^AM[0-9A-Z]{8}$/.test(cleaned)) return `AM-${cleaned.slice(2)}`;
  if (/^[0-9A-Z]{8}$/.test(cleaned)) return `AM-${cleaned}`;
  return cleaned;
}
