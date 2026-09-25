import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column = {
  key: string;
  header: string;
  className?: string;
};

type DataTableProps = {
  columns: Column[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  toolbar?: ReactNode;
  className?: string;
};

export function DataTable({
  columns,
  children,
  emptyMessage = "لا توجد بيانات",
  isEmpty = false,
  toolbar,
  className,
}: DataTableProps) {
  return (
    <div className={cn("card-surface overflow-hidden", className)}>
      {toolbar ? (
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-primary-soft/60 text-right">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 font-semibold text-foreground",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {isEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-primary-light/30", className)}>
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className,
  dir,
}: {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <td dir={dir} className={cn("px-4 py-3 align-middle text-foreground", className)}>
      {children}
    </td>
  );
}
