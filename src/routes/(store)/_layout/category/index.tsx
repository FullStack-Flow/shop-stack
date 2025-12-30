import CategoryTemplate from "@/components/templates/store/category/category-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/category/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CategoryTemplate />;
}
