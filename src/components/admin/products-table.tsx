"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Ban, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

type ProductRow = {
  id: string;
  nameAr: string;
  slug: string;
  sku: string | null;
  price: number;
  stock: number;
  status: keyof typeof PRODUCT_STATUS_LABELS;
  images: Array<{ url: string }>;
  categories: Array<{ category: { nameAr: string } }>;
};

type ProductsTableProps = {
  products: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
  canDelete: boolean;
  canUpdate: boolean;
};

export function ProductsTable({
  products,
  total,
  page,
  totalPages,
  canDelete,
  canUpdate,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function pushFilters(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (!("page" in next)) params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  }

  async function disableProduct(id: string) {
    if (!confirm("تعطيل هذا المنتج؟")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DISABLED" }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل التعطيل");
      return;
    }
    toast.success("تم تعطيل المنتج");
    startTransition(() => router.refresh());
  }

  async function deleteProduct(id: string) {
    if (!confirm("حذف المنتج نهائياً؟ لا يمكن التراجع.")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل الحذف");
      return;
    }
    toast.success("تم حذف المنتج");
    startTransition(() => router.refresh());
  }

  return (
    <DataTable
      columns={[
        { key: "product", header: "المنتج" },
        { key: "sku", header: "SKU" },
        { key: "price", header: "السعر" },
        { key: "stock", header: "المخزون" },
        { key: "status", header: "الحالة" },
        { key: "actions", header: "إجراءات" },
      ]}
      isEmpty={products.length === 0}
      emptyMessage="لا توجد منتجات"
      toolbar={
        <>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") pushFilters({ q });
                }}
                placeholder="بحث بالاسم أو SKU..."
                className="w-full rounded-xl border border-border bg-white py-2.5 pr-10 pl-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <select
              className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
              defaultValue={searchParams.get("status") ?? ""}
              onChange={(e) => pushFilters({ status: e.target.value })}
            >
              <option value="">كل الحالات</option>
              {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
              defaultValue={searchParams.get("sort") ?? "newest"}
              onChange={(e) => pushFilters({ sort: e.target.value })}
            >
              <option value="newest">الأحدث</option>
              <option value="name">الاسم</option>
              <option value="price-asc">السعر ↑</option>
              <option value="price-desc">السعر ↓</option>
              <option value="stock">المخزون</option>
            </select>
            <button
              type="button"
              className="btn-secondary py-2.5 text-sm"
              onClick={() => pushFilters({ q })}
            >
              بحث
            </button>
          </div>
          <Link href="/admin/products/new" className="btn-primary py-2.5 text-sm">
            <Plus className="h-4 w-4" />
            منتج جديد
          </Link>
        </>
      }
    >
      {products.map((product) => (
        <DataTableRow key={product.id} className={pending ? "opacity-60" : undefined}>
          <DataTableCell>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]?.url ?? "/logo.png"}
                alt=""
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{product.nameAr}</p>
                <p className="truncate text-xs text-muted">
                  {product.categories.map((c) => c.category.nameAr).join(" · ") || "بدون تصنيف"}
                </p>
              </div>
            </div>
          </DataTableCell>
          <DataTableCell className="font-mono text-xs" dir="ltr">
            {product.sku || "—"}
          </DataTableCell>
          <DataTableCell>{formatPrice(product.price)}</DataTableCell>
          <DataTableCell>
            <span className={product.stock <= 5 ? "font-semibold text-danger" : undefined}>
              {product.stock}
            </span>
          </DataTableCell>
          <DataTableCell>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
              {PRODUCT_STATUS_LABELS[product.status]}
            </span>
          </DataTableCell>
          <DataTableCell>
            <div className="flex items-center gap-1">
              {canUpdate ? (
                <>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary"
                    title="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted hover:bg-amber-50 hover:text-warning"
                    title="تعطيل"
                    onClick={() => disableProduct(product.id)}
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                </>
              ) : null}
              {canDelete ? (
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-danger"
                  title="حذف"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </DataTableCell>
        </DataTableRow>
      ))}
      <tr>
        <td colSpan={6} className="border-t border-border px-4 py-3 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>
              {total} منتج · صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
                onClick={() => pushFilters({ page: String(page - 1) })}
              >
                السابق
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
                onClick={() => pushFilters({ page: String(page + 1) })}
              >
                التالي
              </button>
            </div>
          </div>
        </td>
      </tr>
    </DataTable>
  );
}
