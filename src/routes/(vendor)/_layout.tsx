import { createFileRoute, Outlet } from '@tanstack/react-router';
import VendorDashboardLayout from '@/components/templates/vendor/vendor-dashboard-layout';

export const Route = createFileRoute('/(vendor)/_layout')({
  component: VendorLayoutComponent,
});

function VendorLayoutComponent() {
  return (
    <VendorDashboardLayout>
      <Outlet />
    </VendorDashboardLayout>
  );
}
