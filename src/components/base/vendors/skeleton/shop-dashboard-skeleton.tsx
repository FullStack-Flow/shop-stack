import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopStatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-1 h-8 w-24" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function ShopStatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ShopStatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShopChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-75 w-full" />
      </CardContent>
    </Card>
  );
}

export function ShopProductCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-50 w-full" />
      </CardContent>
    </Card>
  );
}

export function ShopDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Grid */}
      <ShopStatsGridSkeleton />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ShopChartCardSkeleton />
        </div>
        <div className="col-span-3">
          <ShopChartCardSkeleton />
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <ShopProductCardSkeleton />
        <ShopProductCardSkeleton />
      </div>
    </div>
  );
}
