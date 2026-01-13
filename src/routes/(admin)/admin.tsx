import { createFileRoute, Outlet } from '@tanstack/react-router';
import AdminDashboardLayout from '@/components/templates/admin/admin-dashboard-layout';

export const Route = createFileRoute('/(admin)/admin')({
  component: AdminDashboardRouteComponent,
});

function AdminDashboardRouteComponent() {
  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  );
}
