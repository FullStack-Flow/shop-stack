import {
  DollarSign,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  LowStockAlert,
  OrderStatusChart,
  PendingReviewsList,
  PlatformHealthCard,
  QuickActionsPanel,
  RecentOrdersTable,
  RevenueChart,
  StatsCard,
  TopProductsList,
  TopShopsList,
} from "@/components/containers/admin/dashboard";
import {
  useAdminDashboardStats,
  useLowStockAlerts,
  useOrderDistribution,
  usePendingReviews,
  usePlatformHealth,
  useRecentOrders,
  useRevenueChartData,
  useTopProducts,
  useTopShops,
} from "@/hooks/admin/use-admin-dashboard";

export function AdminDashboardTemplate() {
  // Fetch all dashboard data
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueChartData();
  const { data: orderDistribution, isLoading: orderDistLoading } =
    useOrderDistribution();
  const { data: topShops, isLoading: topShopsLoading } = useTopShops();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockAlerts();
  const { data: recentOrders, isLoading: recentOrdersLoading } =
    useRecentOrders();
  const { data: pendingReviews, isLoading: pendingReviewsLoading } =
    usePendingReviews();
  const { data: platformHealth, isLoading: platformHealthLoading } =
    usePlatformHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Platform-wide overview and analytics
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <TrendingUp className="size-4" />
          <span>Real-time data</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          change={stats?.revenueGrowth}
          changeLabel="vs last month"
          icon={DollarSign}
          format="currency"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change={stats?.ordersGrowth}
          changeLabel="vs last month"
          icon={ShoppingBag}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          changeLabel={`+${stats?.newUsersToday || 0} today`}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Shops"
          value={stats?.activeShops || 0}
          changeLabel={`of ${stats?.totalShops || 0} total`}
          icon={Store}
          isLoading={statsLoading}
        />
      </div>

      {/* Secondary KPI Cards - Today's Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={stats?.todayRevenue || 0}
          icon={DollarSign}
          format="currency"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={ShoppingBag}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Platform Fees"
          value={stats?.platformFees || 0}
          icon={TrendingUp}
          format="currency"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <RevenueChart data={revenueData || []} isLoading={revenueLoading} />
        <OrderStatusChart
          data={orderDistribution || []}
          isLoading={orderDistLoading}
        />
      </div>

      {/* Top Performers Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopShopsList shops={topShops || []} isLoading={topShopsLoading} />
        <TopProductsList
          products={topProducts || []}
          isLoading={topProductsLoading}
        />
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable
        orders={recentOrders || []}
        isLoading={recentOrdersLoading}
      />

      {/* Alerts and Health Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LowStockAlert products={lowStock || []} isLoading={lowStockLoading} />
        <PendingReviewsList
          reviews={pendingReviews || []}
          isLoading={pendingReviewsLoading}
        />
        <PlatformHealthCard
          data={platformHealth || null}
          isLoading={platformHealthLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />
    </div>
  );
}
