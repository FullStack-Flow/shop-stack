import type { PaginatedResponse } from "./api-response";
import type { NormalizedProduct } from "./products";

export interface Store {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  memberSince: string;
  totalProducts: number;
  followers: number;
  category: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  businessHours?: string;
}

export interface StoreFilters {
  search: string;
  category: string;
  minRating: number;
  verifiedOnly: boolean;
  sortBy: "rating" | "newest" | "popular" | "name";
}

export interface StoreStats {
  totalProducts: number;
  followers: number;
  rating: number;
  memberSince: string;
}

export interface StoreReview {
  id: string;
  storeId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export type StoreProduct = Omit<
  NormalizedProduct,
  "costPrice" | "lowStockThreshold" | "trackInventory"
>;

/**
 * Display-ready product format for ProductCard component
 * Adapts the API response to the UI component expectations
 */
export interface DisplayProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price: {
    current: number;
    original: number;
    currency: string;
    discountPercentage: number;
  };
  images: {
    id: string;
    url: string;
    alt: string;
  }[];
  rating: {
    average: number;
    count: number;
  };
  stock: {
    inStock: boolean;
    quantity: number;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  brand: string;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export type StoreProductListResponse = PaginatedResponse<StoreProduct>;
