export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
}

export interface ShippingPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  canCreate: boolean;
}
