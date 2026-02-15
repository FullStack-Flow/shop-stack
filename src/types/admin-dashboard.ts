export interface DashboardStats {
  // Counts
  totalUsers: number;
  totalVendors: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;

  // Revenue
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;

  // Orders by status
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  // Growth (vs last month)
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;

  // Platform health
  activeShops: number;
  connectedVendors: number;
  platformFees: number;

  // Today's metrics
  todayOrders: number;
  newUsersToday: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TopShop {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  revenue: number;
  orderCount: number;
  productCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  shopName: string;
  totalSold: number;
  revenue: number;
  image: string | null;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  threshold: number;
  shopName: string;
  shopSlug: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string;
  shopName: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

export interface PendingReview {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  createdAt: string;
}
