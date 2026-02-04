import { createFileRoute } from "@tanstack/react-router";
import ProductListingTemplate from "@/components/templates/store/product-page/product-listing-template";
import { storeBrandsQueryOptions } from "@/hooks/store/use-store-brands";
import { storeCategoriesQueryOptions } from "@/hooks/store/use-store-categories";
import { storeProductsInfiniteQueryOptions } from "@/hooks/store/use-store-product";

export const Route = createFileRoute("/(store)/_layout/product/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchInfiniteQuery(
        storeProductsInfiniteQueryOptions(),
      ),
      context.queryClient.prefetchQuery(
        storeCategoriesQueryOptions({ limit: 50 }),
      ),
      context.queryClient.prefetchQuery(storeBrandsQueryOptions({ limit: 50 })),
    ]);

    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductListingTemplate />;
}
