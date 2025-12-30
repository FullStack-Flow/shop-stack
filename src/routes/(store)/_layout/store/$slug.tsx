import StorePageTemplate from "@/components/templates/store/storefront/store-page-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/store/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <StorePageTemplate slug={slug} />;
}
