import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardTemplate } from "@/components/templates/admin/admin-dashboard-template";

export const Route = createFileRoute("/(admin)/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return <AdminDashboardTemplate />;
}
