import { createFileRoute } from "@tanstack/react-router";
import StorePageTemplate from "@/components/templates/store/storefront/store-page-template";

export const Route = createFileRoute("/(store)/_layout/store/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <StorePageTemplate slug={slug} />;
}
