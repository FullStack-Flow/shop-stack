import type { PaginatedResponse } from "./api-response";

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

export interface StoreShop {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  vendorName: string | null;
  createdAt: string;
}

export type StoreShopListResponse = PaginatedResponse<StoreShop>;
