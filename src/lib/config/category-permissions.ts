import type { CategoryPermissions } from '@/types/category-types';

export const ADMIN_CATEGORY_PERMISSIONS: CategoryPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canToggleStatus: true,
};

export const VENDOR_CATEGORY_PERMISSIONS: CategoryPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canToggleStatus: false,
};
