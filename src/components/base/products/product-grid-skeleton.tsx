import { Skeleton } from "@/components/ui/skeleton";

export default function ProductGridSkeleton() {
  return (
    <div className="grid @4xl:grid-cols-2 @7xl:grid-cols-3 grid-cols-1 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
