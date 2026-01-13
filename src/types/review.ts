export interface Review {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status: 'published' | 'pending' | 'rejected';
}

export interface ReviewPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canUpdateStatus: boolean;
}
