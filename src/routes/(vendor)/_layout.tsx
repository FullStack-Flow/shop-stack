import { createFileRoute, Outlet } from "@tanstack/react-router";
import VendorDashboardLayout from "@/components/templates/vendor/vendor-dashboard-layout";
import { authMiddleware } from "@/lib/middleware/auth";

export const Route = createFileRoute("/(vendor)/_layout")({
  server: {
    middleware: [authMiddleware],
  },
  component: VendorLayoutComponent,
});

function VendorLayoutComponent() {
  return (
    <VendorDashboardLayout>
      <Outlet />
    </VendorDashboardLayout>
  );
}
