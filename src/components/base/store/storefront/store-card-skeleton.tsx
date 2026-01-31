import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden bg-card py-0">
      {/* Banner Skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      <CardContent className="space-y-5 p-6">
        {/* Logo and Name */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 rounded-lg border bg-muted/30 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-muted border-t pt-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StoreListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Results Count Skeleton */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Store Grid Skeleton */}
      <div className="grid @5xl:grid-cols-2 @[95rem]:grid-cols-3 grid-cols-1 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
