import { Skeleton } from "@/components/ui/skeleton";

export function StoreProductsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Header with count and sort */}
      <div className="flex @2xl:flex-row flex-col items-start @2xl:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-45" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid @2xl:grid-cols-2 @5xl:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border-2 border-muted border-dashed p-4"
          >
            <Skeleton className="aspect-square w-full rounded-t-2xl" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
              <div className="flex items-center justify-between border-muted border-t border-dashed pt-3">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
