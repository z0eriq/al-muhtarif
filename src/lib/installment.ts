export function productInstallmentUrl(product: {
  installmentAvailable?: boolean | null;
  installmentUrl?: string | null;
}): string | null {
  if (!product.installmentAvailable) return null;
  const url = product.installmentUrl?.trim();
  if (!url || !URL.canParse(url)) return null;
  return url;
}
