import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import AdminTransactionsTemplate from "@/components/templates/admin/admin-transactions-template";
import { createAdminTransactionsFetcher } from "@/hooks/admin/use-admin-entity-fetchers";
import { useAdminTransactionStats } from "@/hooks/admin/use-admin-transactions";

export const Route = createFileRoute("/(admin)/admin/transactions/")({
  component: AdminTransactionsPage,
  pendingComponent: PageSkeleton,
});

function AdminTransactionsPage() {
  const fetcher = createAdminTransactionsFetcher();
  const { data: stats } = useAdminTransactionStats();

  return <AdminTransactionsTemplate fetcher={fetcher} stats={stats} />;
}
