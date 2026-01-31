import { createFileRoute } from "@tanstack/react-router";
import CategoryDetailTemplate from "@/components/templates/store/category/category-detail-template";

export const Route = createFileRoute("/(store)/_layout/category/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <CategoryDetailTemplate slug={slug} />;
}
