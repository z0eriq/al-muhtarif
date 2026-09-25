import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/lib/meta-pixel";
import type { MetaCustomData, MetaStandardEvent } from "@/lib/meta-events";

const GRAPH_VERSION = "v21.0";

export type MetaUserPayload = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  externalId?: string | null;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeIraqiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("964")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `964${digits.slice(1)}`;
  if (digits.startsWith("7") && digits.length === 10) return `964${digits}`;
  return digits;
}

function hashedList(value?: string | null, transform?: (v: string) => string) {
  if (!value?.trim()) return undefined;
  const prepared = transform ? transform(value) : value.trim().toLowerCase();
  if (!prepared) return undefined;
  return [sha256(prepared)];
}

function firstName(name?: string | null): string | undefined {
  const part = name?.trim().split(/\s+/)[0];
  return part ? part.toLowerCase() : undefined;
}

export function buildUserData(user: MetaUserPayload): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const email = hashedList(user.email, normalizeEmail);
  const phone = hashedList(user.phone, normalizeIraqiPhone);
  const fn = hashedList(firstName(user.name));
  const city = hashedList(user.city);
  const externalId = hashedList(
    user.externalId ?? user.phone ?? undefined,
    (value) => normalizeIraqiPhone(value) || value.trim().toLowerCase(),
  );

  if (email) data.em = email;
  if (phone) data.ph = phone;
  if (fn) data.fn = fn;
  if (city) data.ct = city;
  data.country = [sha256("iq")];
  if (externalId) data.external_id = externalId;
  if (user.clientIp && user.clientIp !== "unknown") {
    data.client_ip_address = user.clientIp;
  }
  if (user.userAgent) data.client_user_agent = user.userAgent;
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;
  return data;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function readRequestCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const prefix = `${name}=`;
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!match) return null;
  return decodeURIComponent(match.slice(prefix.length));
}

export async function sendMetaCapiEvent(options: {
  eventName: MetaStandardEvent;
  eventId: string;
  eventSourceUrl: string;
  customData?: MetaCustomData;
  user: MetaUserPayload;
}): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!token || !META_PIXEL_ID) return;

  const payload = {
    data: [
      {
        event_name: options.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: options.eventId,
        event_source_url: options.eventSourceUrl,
        action_source: "website",
        user_data: buildUserData(options.user),
        custom_data: options.customData,
      },
    ],
    access_token: token,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("[meta-capi] event failed", response.status, detail.slice(0, 400));
    }
  } catch (error) {
    console.error("[meta-capi] request failed", error);
  }
}
