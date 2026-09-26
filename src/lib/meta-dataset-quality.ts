import { META_PIXEL_ID } from "@/lib/meta-pixel";

const GRAPH_VERSION = "v21.0";
const QUALITY_FIELDS =
  "web{event_name,event_match_quality,event_coverage,data_freshness}";

export type DatasetQualityEvent = {
  eventName: string;
  matchScore?: number;
  coverage?: number;
  freshness?: string;
};

type GraphQualityEvent = {
  event_name?: string;
  event_match_quality?: { composite_score?: number };
  event_coverage?: { percentage?: number; description?: string };
  data_freshness?: { upload_frequency?: string; description?: string };
};

export async function getDatasetQuality(): Promise<{
  events: DatasetQualityEvent[];
  error?: string;
}> {
  const token =
    process.env.META_DATASET_QUALITY_ACCESS_TOKEN?.trim() ||
    process.env.META_CAPI_ACCESS_TOKEN?.trim();

  if (!token || !META_PIXEL_ID) {
    return { events: [], error: "رمز جودة مجموعة البيانات غير مضبوط" };
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/dataset_quality`);
  url.searchParams.set("dataset_id", META_PIXEL_ID);
  url.searchParams.set("fields", QUALITY_FIELDS);
  url.searchParams.set("access_token", token);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    const json = (await response.json()) as {
      web?: GraphQualityEvent[];
      error?: { message?: string };
    };

    if (!response.ok || json.error) {
      console.error("[meta-quality] fetch failed", json.error?.message);
      return { events: [], error: "تعذر قراءة جودة مجموعة البيانات حالياً" };
    }

    const events = (json.web ?? [])
      .filter((item) => item.event_name)
      .map((item) => ({
        eventName: item.event_name as string,
        matchScore: item.event_match_quality?.composite_score,
        coverage: item.event_coverage?.percentage,
        freshness:
          item.data_freshness?.description ?? item.data_freshness?.upload_frequency,
      }));

    return { events };
  } catch (error) {
    console.error("[meta-quality] request failed", error);
    return { events: [], error: "تعذر الاتصال بواجهة جودة مجموعة البيانات" };
  }
}
