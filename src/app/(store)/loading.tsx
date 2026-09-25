import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-store space-y-10 py-10">
      <div className="skeleton h-64 w-full rounded-[1.75rem]" />
      <div className="skeleton h-8 w-48" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
