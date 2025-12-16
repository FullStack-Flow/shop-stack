import Header from "@/components/base/common/header";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
