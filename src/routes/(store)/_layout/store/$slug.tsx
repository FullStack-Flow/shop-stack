import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/store/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(store)/_layout/store/$slug"!</div>;
}
