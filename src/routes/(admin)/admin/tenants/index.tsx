import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminTenantsTemplate from "@/components/templates/admin/tenants/admin-tenants-template";
import { createAdminTenantsFetcher } from "@/hooks/admin/use-admin-entity-fetchers";

export const Route = createFileRoute("/(admin)/admin/tenants/")({
  component: AdminTenantsPage,
  pendingComponent: PageSkeleton,
});

function AdminTenantsPage() {
  const fetcher = createAdminTenantsFetcher();

  return <AdminTenantsTemplate fetcher={fetcher} />;
}
