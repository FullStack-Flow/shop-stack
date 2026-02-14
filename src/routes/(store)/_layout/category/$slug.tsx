import { createFileRoute } from "@tanstack/react-router";
import CategoryDetailTemplate from "@/components/templates/store/category/category-detail-template";
import { storeCategoryBySlugQueryOptions } from "@/hooks/store/use-store-categories";

export const Route = createFileRoute("/(store)/_layout/category/$slug")({
  loader: async ({ context, params }) => {
    // Prefetch category by slug
    await context.queryClient.prefetchQuery(
      storeCategoryBySlugQueryOptions(params.slug),
    );

    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <CategoryDetailTemplate slug={slug} />;
}
