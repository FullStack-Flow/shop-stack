export interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  category: string;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: string;
  status: "active" | "pending";
}

export interface ShopFormValues {
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  address: string;
  phone: string;
  email: string;
  enableNotification: boolean;
}
