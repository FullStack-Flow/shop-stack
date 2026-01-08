export interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo?: string;
  description?: string;
}

export interface BrandPermissions {
  canDelete?: boolean;
  canEdit?: boolean;
  canView?: boolean;
}