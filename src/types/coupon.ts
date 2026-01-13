export interface Coupon {
  id: string;
  image: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discountAmount: number;
  minimumCartAmount: number;
  activeFrom: string;
  activeTo: string;
  status: 'active' | 'expired' | 'inactive';
  usageLimit?: number;
  usageCount: number;
}

export interface CouponFormValues {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  discountAmount: number;
  minimumCartAmount: number;
  activeFrom: string;
  activeTo: string;
  status: 'active' | 'expired' | 'inactive';
  usageLimit?: number;
  image?: FileList | null;
}

export interface CouponPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canToggleStatus: boolean;
}
