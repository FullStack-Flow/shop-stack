import ShopDashboardLayout from "@/components/templates/vendor/shop-dashboard-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/shop/$slug")({
  component: ShopLayoutComponent,
});

function ShopLayoutComponent() {
  const { slug } = Route.useParams();

  const shopName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <ShopDashboardLayout shopName={shopName} shopSlug={slug}>
      <Outlet />
    </ShopDashboardLayout>
  );
}
