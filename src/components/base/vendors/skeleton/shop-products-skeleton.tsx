import { Skeleton } from "@/components/ui/skeleton";

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="space-y-4 p-4">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-4 border-b pb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>

          {/* Data Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-7 items-center gap-4 border-b py-4 last:border-b-0"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="ml-auto h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopProductsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table */}
      <ProductTableSkeleton />
    </div>
  );
}
