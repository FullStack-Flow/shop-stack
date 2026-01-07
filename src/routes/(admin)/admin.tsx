import AdminDashboardLayout from "@/components/templates/admin/admin-dashboard-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/admin")({
  component: AdminDashboardRouteComponent,
});

function AdminDashboardRouteComponent() {
  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  );
}
