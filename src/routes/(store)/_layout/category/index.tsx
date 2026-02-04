import { createFileRoute } from "@tanstack/react-router";
import CategoryTemplate from "@/components/templates/store/category/category-template";
import {
  categoryTreeQueryOptions,
  featuredCategoriesQueryOptions,
  storeCategoriesQueryOptions,
} from "@/hooks/store/use-store-categories";

export const Route = createFileRoute("/(store)/_layout/category/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        storeCategoriesQueryOptions({ limit: 50 }),
      ),
      context.queryClient.prefetchQuery(featuredCategoriesQueryOptions(8)),
      context.queryClient.prefetchQuery(categoryTreeQueryOptions()),
    ]);

    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryTemplate />;
}
