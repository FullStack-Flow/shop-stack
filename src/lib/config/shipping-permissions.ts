import type { ShippingPermissions } from "@/types/shipping";

export const ADMIN_SHIPPING_PERMISSIONS: ShippingPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canCreate: true,
};

export const VENDOR_SHIPPING_PERMISSIONS: ShippingPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canCreate: true,
};
