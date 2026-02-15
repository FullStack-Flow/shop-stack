import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import ShopOrdersTemplate from "@/components/templates/vendor/shop-orders-template";
import { createVendorOrdersFetcher } from "@/hooks/vendors/use-vendor-entity-fetchers";
import { useVendorOrderStats } from "@/hooks/vendors/use-vendor-orders";

export const Route = createFileRoute("/(vendor)/shop/$slug/orders/")({
  component: OrdersPage,
  pendingComponent: PageSkeleton,
});

function OrdersPage() {
  const { slug } = Route.useParams();

  // Create fetcher for server-side pagination
  const fetcher = useMemo(() => createVendorOrdersFetcher(slug), [slug]);

  // Get order stats
  const { data: stats } = useVendorOrderStats(slug);

  return <ShopOrdersTemplate fetcher={fetcher} stats={stats} shopSlug={slug} />;
}
