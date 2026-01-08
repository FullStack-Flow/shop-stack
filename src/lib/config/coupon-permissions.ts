import type { CouponPermissions } from "@/types/coupon";

export const ADMIN_COUPON_PERMISSIONS: CouponPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canToggleStatus: true,
};

export const VENDOR_COUPON_PERMISSIONS: CouponPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canToggleStatus: false,
};