import VendorDashboardLayout from "@/components/templates/vendor/vendor-dashboard-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(vendor)/_layout")({
  component: VendorLayoutComponent,
});

function VendorLayoutComponent() {
  return (
    <VendorDashboardLayout>
      <Outlet />
    </VendorDashboardLayout>
  );
}
