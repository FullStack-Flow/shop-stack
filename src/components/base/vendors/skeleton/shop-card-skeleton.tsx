import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Banner */}
      <Skeleton className="h-32 w-full rounded-none" />

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1 rounded-lg bg-muted p-2">
              <Skeleton className="mx-auto h-3 w-12" />
              <Skeleton className="mx-auto h-4 w-8" />
              <Skeleton className="mx-auto h-2 w-16" />
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
}

export function MyShopsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ShopCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MyShopsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Shops Grid */}
      <MyShopsGridSkeleton />
    </div>
  );
}
