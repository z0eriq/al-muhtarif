export function toOptionalHttpUrl(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return URL.canParse(withProtocol) ? withProtocol : trimmed;
}

export function isOptionalHttpUrl(value: string | null): boolean {
  return value === null || URL.canParse(value);
}

export function extractMapsEmbedSrc(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const srcMatch = trimmed.match(/\bsrc=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1].trim();

  if (trimmed.includes("<iframe") || trimmed.includes("</iframe>")) {
    return null;
  }

  return trimmed;
}
