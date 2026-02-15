export interface DashboardStats {
  monthlyRevenue: number;
  previousMonthRevenue: number;
  totalProducts: number;
  newProductsThisMonth: number;
  totalOrders: number;
  previousMonthOrders: number;
  conversionRate: number;
  previousConversionRate: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  image: string | null;
  totalSold: number;
  revenue: number;
}

export interface DashboardMonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

export interface ShopDashboardData {
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
  monthlySales: DashboardMonthlySales[];
}
