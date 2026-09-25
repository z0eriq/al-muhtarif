"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

type InventoryRow = {
  id: string;
  nameAr: string;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  status: string;
  images: Array<{ url: string }>;
};

export function InventoryManager({
  products,
  canManage,
  lowStockAlert,
}: {
  products: InventoryRow[];
  canManage: boolean;
  lowStockAlert: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, p.stock])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  async function save(productId: string) {
    setSavingId(productId);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          stock: stocks[productId] ?? 0,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "فشل التحديث");
      toast.success("تم تحديث المخزون");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التحديث");
    } finally {
      setSavingId(null);
    }
  }

  const lowCount = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || lowStockAlert),
  ).length;
  const outCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
          مخزون منخفض: <strong>{lowCount}</strong> منتج
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          نفد المخزون: <strong>{outCount}</strong> منتج
        </div>
      </div>

      <DataTable
        columns={[
          { key: "product", header: "المنتج" },
          { key: "sku", header: "SKU" },
          { key: "threshold", header: "حد التنبيه" },
          { key: "stock", header: "المخزون" },
          { key: "alert", header: "التنبيه" },
          { key: "actions", header: "تعديل سريع" },
        ]}
        isEmpty={products.length === 0}
        emptyMessage="لا توجد منتجات"
      >
        {products.map((product) => {
          const threshold = product.lowStockThreshold || lowStockAlert;
          const stock = stocks[product.id] ?? product.stock;
          const alert =
            stock <= 0 ? "نفد" : stock <= threshold ? "منخفض" : "جيد";
          const alertClass =
            stock <= 0
              ? "bg-red-50 text-danger"
              : stock <= threshold
                ? "bg-amber-50 text-warning"
                : "bg-emerald-50 text-success";

          return (
            <DataTableRow
              key={product.id}
              className={pending ? "opacity-60" : undefined}
            >
              <DataTableCell>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]?.url ?? "/logo.png"}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <span className="font-semibold">{product.nameAr}</span>
                </div>
              </DataTableCell>
              <DataTableCell dir="ltr" className="text-xs font-mono">
                {product.sku || "—"}
              </DataTableCell>
              <DataTableCell>{threshold}</DataTableCell>
              <DataTableCell>
                {canManage ? (
                  <input
                    type="number"
                    min={0}
                    className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm"
                    value={stock}
                    onChange={(e) =>
                      setStocks((prev) => ({
                        ...prev,
                        [product.id]: Number(e.target.value),
                      }))
                    }
                  />
                ) : (
                  stock
                )}
              </DataTableCell>
              <DataTableCell>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${alertClass}`}>
                  {alert}
                </span>
              </DataTableCell>
              <DataTableCell>
                {canManage ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                    disabled={savingId === product.id || stock === product.stock}
                    onClick={() => save(product.id)}
                  >
                    <Save className="h-3.5 w-3.5" />
                    حفظ
                  </button>
                ) : (
                  "—"
                )}
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
