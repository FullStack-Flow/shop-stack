export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  level: number;
  productCount: number;
  subcategories?: Category[];
  isActive: boolean;
  featured?: boolean;
  sortOrder: number;
}

export interface CategoryFilters {
  search?: string;
  featured?: boolean;
  parentId?: string;
  level?: number;
}

export interface CategoryWithChildren extends Category {
  subcategories: CategoryWithChildren[];
  productCount: number; // Total products including subcategories
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  image: FileList | null;
  icon: string;
  parentId: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}
