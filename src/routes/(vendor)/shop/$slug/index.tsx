import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ShopDashboardSkeleton } from "@/components/base/vendors/skeleton/shop-dashboard-skeleton";
import ShopDashboardTemplate from "@/components/templates/vendor/shop-dashboard-template";
import { useShopDashboard } from "@/hooks/vendors/use-shop-dashboard";
import { shopBySlugQueryOptions } from "@/hooks/vendors/use-shops";

export const Route = createFileRoute("/(vendor)/shop/$slug/")({
  component: ShopDashboardPage,
  pendingComponent: ShopDashboardSkeleton,
});

function ShopDashboardPage() {
  const { slug } = Route.useParams();

  // Get shop data to retrieve shopId
  const { data: shopData } = useSuspenseQuery(shopBySlugQueryOptions(slug));
  const shopId = shopData?.shop?.id ?? "";

  // Fetch aggregated dashboard data
  const { data: dashboardData } = useShopDashboard(shopId, slug);

  return (
    <ShopDashboardTemplate shopName={slug} dashboardData={dashboardData} />
  );
}
