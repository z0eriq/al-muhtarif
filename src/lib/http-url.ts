import { STORE } from "@/lib/constants";

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

export function toMapsEmbedSrc(value: unknown): string | null {
  const extracted = extractMapsEmbedSrc(value);
  if (!extracted) return null;

  if (
    extracted.includes("/maps/embed") ||
    /[?&]output=embed\b/i.test(extracted)
  ) {
    return extracted;
  }

  const atMatch = extracted.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=17&hl=ar&output=embed`;
  }

  const queryMatch = extracted.match(
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  );
  if (queryMatch) {
    return `https://www.google.com/maps?q=${queryMatch[1]},${queryMatch[2]}&z=17&hl=ar&output=embed`;
  }

  if (
    extracted.includes("maps.app.goo.gl/cgcFdUcUBdXa6EKWA") ||
    extracted.includes("goo.gl/cgcFdUcUBdXa6EKWA")
  ) {
    return STORE.mapsEmbedUrl;
  }

  return extracted;
}
