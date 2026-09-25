import type { DatasetQualityEvent } from "@/lib/meta-dataset-quality";

const EVENT_LABELS: Record<string, string> = {
  PageView: "مشاهدة صفحة",
  ViewContent: "مشاهدة محتوى",
  AddToCart: "إضافة إلى السلة",
  InitiateCheckout: "بدء الدفع",
  Lead: "عميل محتمل",
  Purchase: "شراء",
};

type DatasetQualityCardProps = {
  events: DatasetQualityEvent[];
  error?: string;
};

export function DatasetQualityCard({ events, error }: DatasetQualityCardProps) {
  return (
    <div className="card-surface p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold">جودة مجموعة بيانات ميتا</h3>
        <p className="mt-1 text-sm text-muted">
          معدل مطابقة الأحداث وتغطية Conversion API من Dataset Quality API
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted">
          ستظهر المقاييس هنا بعد وصول أحداث كافية إلى ميتا.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.eventName}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold">
                  {EVENT_LABELS[event.eventName] ?? event.eventName}
                </p>
                <p className="text-xs text-muted" dir="ltr">
                  {event.eventName}
                  {event.freshness ? ` · ${event.freshness}` : ""}
                </p>
              </div>
              <div className="text-end text-xs text-muted">
                {event.matchScore != null ? (
                  <p>
                    المطابقة:{" "}
                    <span className="font-bold text-foreground">{event.matchScore}/10</span>
                  </p>
                ) : (
                  <p>بانتظار درجة المطابقة</p>
                )}
                {event.coverage != null ? <p>التغطية: {event.coverage}%</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
