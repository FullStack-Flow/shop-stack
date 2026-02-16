import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminOrdersTemplate from "@/components/templates/admin/admin-orders-template";
import { createAdminOrdersFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useAdminOrderStats } from "@/hooks/admin/use-admin-orders";

export const Route = createFileRoute("/(admin)/admin/orders/")({
  component: AdminOrdersPage,
  pendingComponent: PageSkeleton,
});

function AdminOrdersPage() {
  const fetcher = createAdminOrdersFetcher();
  const { data: stats } = useAdminOrderStats();

  return <AdminOrdersTemplate fetcher={fetcher} stats={stats} />;
}
