import { createFileRoute } from "@tanstack/react-router";
import StorePageTemplate from "@/components/templates/store/storefront/store-page-template";
import { storeShopBySlugQueryOptions } from "@/hooks/store/use-store-shops";

export const Route = createFileRoute("/(store)/_layout/store/$slug")({
  loader: async ({ context, params }) => {
    // Prefetch store data for faster page load
    await context.queryClient.prefetchQuery(
      storeShopBySlugQueryOptions(params.slug),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <StorePageTemplate slug={slug} />;
}
