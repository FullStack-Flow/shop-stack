import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "../data-table/data-table-skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Table */}
      <DataTableSkeleton columnCount={6} rowCount={8} />
    </div>
  );
}
