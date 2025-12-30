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
  sortBy: 'rating' | 'newest' | 'popular' | 'name';
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

export interface StoreProduct {
  id: string;
  storeId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}
