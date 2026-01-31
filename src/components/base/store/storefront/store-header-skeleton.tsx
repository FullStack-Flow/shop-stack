import { Skeleton } from "@/components/ui/skeleton";

export function StoreHeaderSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* Store Info */}
      <div className="flex @3xl:flex-row flex-col gap-6">
        {/* Logo and Basic Info */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid @3xl:w-auto w-full grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 text-center">
              <Skeleton className="mx-auto h-6 w-16" />
              <Skeleton className="mx-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
