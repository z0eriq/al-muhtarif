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

type CapiServerEvent = {
  event_name: MetaStandardEvent;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
  page_id?: string;
  original_event_data: {
    event_name: MetaStandardEvent;
    event_time: number;
  };
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

function nameParts(name?: string | null): { fn?: string; ln?: string } {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return {};
  return {
    fn: parts[0]?.toLowerCase(),
    ln: parts.length > 1 ? parts.slice(1).join(" ").toLowerCase() : undefined,
  };
}

function compactRecord(
  input?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!input) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      const cleaned = value.filter((item) => item !== undefined && item !== null && item !== "");
      if (cleaned.length === 0) continue;
      out[key] = cleaned;
      continue;
    }
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function buildUserData(user: MetaUserPayload): Record<string, unknown> {
  const { fn, ln } = nameParts(user.name);
  const data: Record<string, unknown> = {
    em: hashedList(user.email, normalizeEmail),
    ph: hashedList(user.phone, normalizeIraqiPhone),
    fn: hashedList(fn),
    ln: hashedList(ln),
    ct: hashedList(user.city),
    country: [sha256("iq")],
    external_id: hashedList(
      user.externalId ?? user.phone ?? undefined,
      (value) => normalizeIraqiPhone(value) || value.trim().toLowerCase(),
    ),
    client_ip_address:
      user.clientIp && user.clientIp !== "unknown" ? user.clientIp : undefined,
    client_user_agent: user.userAgent?.trim() || undefined,
    fbp: user.fbp?.trim() || undefined,
    fbc: user.fbc?.trim() || undefined,
  };

  return compactRecord(data) ?? {};
}

export function buildCapiServerEvent(options: {
  eventName: MetaStandardEvent;
  eventId: string;
  eventSourceUrl: string;
  customData?: MetaCustomData;
  user: MetaUserPayload;
}): CapiServerEvent {
  const eventTime = Math.floor(Date.now() / 1000);
  const customData = compactRecord(
    options.customData as Record<string, unknown> | undefined,
  );
  const pageId = process.env.META_PAGE_ID?.trim();

  return {
    event_name: options.eventName,
    event_time: eventTime,
    event_id: options.eventId,
    event_source_url: options.eventSourceUrl,
    action_source: "website",
    user_data: buildUserData(options.user),
    ...(customData ? { custom_data: customData } : {}),
    ...(pageId ? { page_id: pageId } : {}),
    original_event_data: {
      event_name: options.eventName,
      event_time: eventTime,
    },
  };
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

  const payload: {
    data: CapiServerEvent[];
    test_event_code?: string;
  } = {
    data: [buildCapiServerEvent(options)],
  };

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const detail = await response.text();
    if (!response.ok) {
      console.error("[meta-capi] event failed", response.status, detail.slice(0, 400));
      return;
    }

    try {
      const parsed = JSON.parse(detail) as {
        events_received?: number;
        messages?: unknown[];
      };
      if (parsed.messages && parsed.messages.length > 0) {
        console.warn("[meta-capi] graph messages", parsed.messages);
      }
      if (parsed.events_received === 0) {
        console.error("[meta-capi] graph accepted zero events", detail.slice(0, 400));
      }
    } catch {
      // Graph sometimes returns a non-JSON body; the HTTP status already succeeded.
    }
  } catch (error) {
    console.error("[meta-capi] request failed", error);
  }
}
