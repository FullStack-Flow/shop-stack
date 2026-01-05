import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/shop/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(vendor)/shop/$slug/"!</div>;
}
