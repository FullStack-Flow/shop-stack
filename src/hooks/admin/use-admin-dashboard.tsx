/**
 * Admin Dashboard Hooks
 *
 * React Query hooks for admin dashboard analytics.
 */

import { useQuery } from "@tanstack/react-query";
import {
  getCustomerGrowthData,
  getDashboardStats,
  getLowStockProducts,
  getOrderDistribution,
  getPendingReviews,
  getPlatformHealth,
  getRecentOrders,
  getRevenueChartData,
  getTopProducts,
  getTopShops,
} from "@/lib/functions/admin/dashboard";

// ============================================================================
// Query Keys
// ============================================================================

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  stats: () => [...adminDashboardKeys.all, "stats"] as const,
  revenueChart: (days: number) =>
    [...adminDashboardKeys.all, "revenue-chart", days] as const,
  orderDistribution: () =>
    [...adminDashboardKeys.all, "order-distribution"] as const,
  topShops: () => [...adminDashboardKeys.all, "top-shops"] as const,
  topProducts: () => [...adminDashboardKeys.all, "top-products"] as const,
  lowStock: () => [...adminDashboardKeys.all, "low-stock"] as const,
  recentOrders: () => [...adminDashboardKeys.all, "recent-orders"] as const,
  pendingReviews: () => [...adminDashboardKeys.all, "pending-reviews"] as const,
  customerGrowth: (days: number) =>
    [...adminDashboardKeys.all, "customer-growth", days] as const,
  platformHealth: () => [...adminDashboardKeys.all, "platform-health"] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch main dashboard statistics
 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: async () => {
      const result = await getDashboardStats();
      return result;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch revenue chart data
 */
export function useRevenueChartData(days: number = 30) {
  return useQuery({
    queryKey: adminDashboardKeys.revenueChart(days),
    queryFn: async () => {
      const result = await getRevenueChartData({ data: { days } });
      return result;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch order status distribution
 */
export function useOrderDistribution() {
  return useQuery({
    queryKey: adminDashboardKeys.orderDistribution(),
    queryFn: async () => {
      const result = await getOrderDistribution();
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch top performing shops
 */
export function useTopShops() {
  return useQuery({
    queryKey: adminDashboardKeys.topShops(),
    queryFn: async () => {
      const result = await getTopShops();
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch top selling products
 */
export function useTopProducts() {
  return useQuery({
    queryKey: adminDashboardKeys.topProducts(),
    queryFn: async () => {
      const result = await getTopProducts();
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch low stock product alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: adminDashboardKeys.lowStock(),
    queryFn: async () => {
      const result = await getLowStockProducts();
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch recent orders
 */
export function useRecentOrders() {
  return useQuery({
    queryKey: adminDashboardKeys.recentOrders(),
    queryFn: async () => {
      const result = await getRecentOrders();
      return result;
    },
    staleTime: 30000,
  });
}

/**
 * Hook to fetch pending reviews for moderation
 */
export function usePendingReviews() {
  return useQuery({
    queryKey: adminDashboardKeys.pendingReviews(),
    queryFn: async () => {
      const result = await getPendingReviews();
      return result;
    },
    staleTime: 30000,
  });
}

/**
 * Hook to fetch customer growth data
 */
export function useCustomerGrowthData(days: number = 30) {
  return useQuery({
    queryKey: adminDashboardKeys.customerGrowth(days),
    queryFn: async () => {
      const result = await getCustomerGrowthData({ data: { days } });
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Hook to fetch platform health status
 */
export function usePlatformHealth() {
  return useQuery({
    queryKey: adminDashboardKeys.platformHealth(),
    queryFn: async () => {
      const result = await getPlatformHealth();
      return result;
    },
    staleTime: 60000,
  });
}

/**
 * Combined hook for all dashboard data
 * Use this when you need everything at once
 */
export function useAdminDashboard() {
  const stats = useAdminDashboardStats();
  const revenueChart = useRevenueChartData();
  const orderDistribution = useOrderDistribution();
  const topShops = useTopShops();
  const topProducts = useTopProducts();
  const lowStock = useLowStockAlerts();
  const recentOrders = useRecentOrders();
  const pendingReviews = usePendingReviews();
  const platformHealth = usePlatformHealth();

  return {
    stats,
    revenueChart,
    orderDistribution,
    topShops,
    topProducts,
    lowStock,
    recentOrders,
    pendingReviews,
    platformHealth,
    isLoading:
      stats.isLoading ||
      revenueChart.isLoading ||
      orderDistribution.isLoading ||
      topShops.isLoading,
    isError:
      stats.isError ||
      revenueChart.isError ||
      orderDistribution.isError ||
      topShops.isError,
  };
}
