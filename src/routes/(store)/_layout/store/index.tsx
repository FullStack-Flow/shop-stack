import { createFileRoute } from "@tanstack/react-router";
import StoresListingTemplate from "@/components/templates/store/storefront/stores-listing-template";
import { storeShopsInfiniteQueryOptions } from "@/hooks/store/use-store-shops";

export const Route = createFileRoute("/(store)/_layout/store/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchInfiniteQuery(
      storeShopsInfiniteQueryOptions({
        limit: 12,
        sortBy: "rating",
        sortDirection: "desc",
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <StoresListingTemplate />;
}
