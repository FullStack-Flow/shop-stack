import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/base/common/header";
import Brand from "@/components/templates/store/brand";
import Footer from "@/components/templates/store/footer";

export const Route = createFileRoute("/(store)/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <Outlet />
      <Brand />
      <Footer />
    </>
  );
}
