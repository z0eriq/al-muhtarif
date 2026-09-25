"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import type { CategoryListItem } from "@/services/categories.service";

type ShopFiltersProps = {
  categories: CategoryListItem[];
  variant?: "sidebar" | "drawer";
};

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "bestselling", label: "الأكثر مبيعاً" },
] as const;

function FiltersForm({
  categories,
  onApplied,
}: {
  categories: CategoryListItem[];
  onApplied?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "1");
  const [onSale, setOnSale] = useState(searchParams.get("onSale") === "1");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");

  const apply = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "1");
    if (onSale) params.set("onSale", "1");
    if (sort && sort !== "newest") params.set("sort", sort);
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/shop?${qs}` : "/shop");
      onApplied?.();
    });
  }, [
    q,
    category,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    sort,
    router,
    onApplied,
  ]);

  const reset = () => {
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setOnSale(false);
    setSort("newest");
    startTransition(() => {
      router.push("/shop");
      onApplied?.();
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold">بحث</label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="اسم المنتج..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">التصنيف</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.nameAr} ({cat.productCount})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">من سعر</label>
          <Input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">إلى سعر</label>
          <Input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold">الترتيب</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          متوفر فقط
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          العروض فقط
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={apply} disabled={isPending}>
          <Filter className="h-4 w-4" />
          تطبيق
        </Button>
        <Button variant="secondary" onClick={reset} disabled={isPending}>
          إعادة
        </Button>
      </div>
    </div>
  );
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  return (
    <aside className="hidden h-fit rounded-2xl border border-border bg-white p-5 shadow-sm lg:block">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        تصفية المنتجات
      </h2>
      <FiltersForm categories={categories} />
    </aside>
  );
}

export function ShopFiltersMobile({ categories }: ShopFiltersProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const activeCount = useMemo(() => {
    let n = 0;
    if (searchParams.get("q")) n += 1;
    if (searchParams.get("category")) n += 1;
    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) n += 1;
    if (searchParams.get("inStock") === "1") n += 1;
    if (searchParams.get("onSale") === "1") n += 1;
    if (searchParams.get("sort") && searchParams.get("sort") !== "newest")
      n += 1;
    return n;
  }, [searchParams]);

  return (
    <>
      <Button
        variant="secondary"
        className="w-full lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        تصفية وترتيب
        {activeCount > 0 ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">
            {activeCount}
          </span>
        ) : null}
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="تصفية المنتجات"
        side="right"
      >
        <FiltersForm
          categories={categories}
          onApplied={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
