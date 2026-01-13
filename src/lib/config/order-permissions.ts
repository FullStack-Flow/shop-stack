import type { OrderPermissions } from '@/types/orders';

export const ADMIN_ORDER_PERMISSIONS: OrderPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canUpdateStatus: true,
};

export const VENDOR_ORDER_PERMISSIONS: OrderPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canUpdateStatus: true,
};
