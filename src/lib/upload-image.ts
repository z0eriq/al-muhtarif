const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function imageExtensionForFile(file: {
  type?: string;
  name?: string;
}): string | null {
  const type = file.type?.toLowerCase().trim() ?? "";
  if (ALLOWED_TYPES[type]) return ALLOWED_TYPES[type];

  const name = file.name?.toLowerCase() ?? "";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  if (name.endsWith(".svg")) return "svg";
  return null;
}

export function contentTypeForImageExtension(ext: string): string {
  switch (ext) {
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export function resolvedImageContentType(file: {
  type?: string;
  name?: string;
}): string | null {
  const ext = imageExtensionForFile(file);
  if (!ext) return null;
  const type = file.type?.toLowerCase().trim() ?? "";
  return ALLOWED_TYPES[type] ? type : contentTypeForImageExtension(ext);
}

export function r2PutHeaders(contentType: string, byteLength: number): HeadersInit {
  return {
    "Content-Type": contentType,
    "Content-Length": String(byteLength),
    "Cache-Control": "public, max-age=31536000, immutable",
  };
}
