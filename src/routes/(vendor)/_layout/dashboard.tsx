import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/_layout/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(vendor)/_layout/dashboard"!</div>;
}
