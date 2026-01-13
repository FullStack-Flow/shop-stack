import type { AttributePermissions } from '@/types/attributes';

export const ADMIN_ATTRIBUTE_PERMISSIONS: AttributePermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
};

export const VENDOR_ATTRIBUTE_PERMISSIONS: AttributePermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
};
