import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import ShopTransactionsTemplate from "@/components/templates/vendor/shop-transactions-template";
import { createVendorTransactionsFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import { useVendorTransactionStats } from "@/hooks/vendors/use-vendor-transactions";

export const Route = createFileRoute("/(vendor)/shop/$slug/transactions")({
  component: TransactionsPage,
  pendingComponent: PageSkeleton,
});

function TransactionsPage() {
  const { slug } = Route.useParams();

  // Create fetcher for server-side pagination
  const fetcher = useMemo(() => createVendorTransactionsFetcher(slug), [slug]);

  // Get transaction stats (small query, can stay as hook)
  const { data: stats } = useVendorTransactionStats(slug);

  return (
    <ShopTransactionsTemplate fetcher={fetcher} stats={stats} shopSlug={slug} />
  );
}
