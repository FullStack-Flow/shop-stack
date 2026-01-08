export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
}

export interface TagPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}
