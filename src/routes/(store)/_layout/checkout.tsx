import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/checkout")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(store)/_layout/checkout"!</div>;
}
