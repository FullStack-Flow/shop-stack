import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionSkeleton() {
  return (
    <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="relative border-dashed @6xl:p-7.5 p-5">
          <Skeleton className="h-96.5 w-full rounded-t-2xl" />
          <div className="@6xl:mt-7.5 mt-5 flex items-center gap-3">
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <div className="mt-3 space-y-3.5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
