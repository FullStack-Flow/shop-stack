import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import StatsCard from "@/components/base/vendors/sates-card";
import CustomerInsights from "@/components/containers/vendors/shop/customer-insights";
import RecentOrders from "@/components/containers/vendors/shop/recent-orders";
import SalesOverview from "@/components/containers/vendors/shop/sales-overview";
import TopProducts from "@/components/containers/vendors/shop/top-products";
import { formatCurrency, formatPercentChange } from "@/lib/utils/dashboard";
import type { ShopDashboardData } from "@/types/shop-dashboard";

interface ShopDashboardTemplateProps {
  shopName: string;
  dashboardData: ShopDashboardData;
}

export default function ShopDashboardTemplate({
  shopName,
  dashboardData,
}: ShopDashboardTemplateProps) {
  const { stats, recentOrders, topProducts, monthlySales } = dashboardData;

  // Calculate percentage changes
  const revenueChange = formatPercentChange(
    stats.monthlyRevenue,
    stats.previousMonthRevenue,
  );
  const ordersChange = formatPercentChange(
    stats.totalOrders,
    stats.previousMonthOrders,
  );
  const conversionChange = formatPercentChange(
    stats.conversionRate,
    stats.previousConversionRate,
  );

  const shopStats = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      change: revenueChange,
      icon: DollarSign,
      trend: getTrend(stats.monthlyRevenue, stats.previousMonthRevenue),
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: `+${stats.newProductsThisMonth} new this month`,
      icon: Package,
      trend:
        stats.newProductsThisMonth > 0 ? ("up" as const) : ("neutral" as const),
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: ordersChange,
      icon: ShoppingBag,
      trend: getTrend(stats.totalOrders, stats.previousMonthOrders),
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      change: conversionChange,
      icon: TrendingUp,
      trend: getTrend(stats.conversionRate, stats.previousConversionRate),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Shop Overview</h2>
        <p className="text-muted-foreground">
          Monitor your shop's performance and key metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {shopStats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesOverview
          className="col-span-4"
          shopName={shopName}
          monthlySales={monthlySales}
        />
        <RecentOrders className="col-span-3" orders={recentOrders} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopProducts products={topProducts} />
        <CustomerInsights orders={recentOrders} />
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getTrend(
  current: number,
  previous: number,
): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}
