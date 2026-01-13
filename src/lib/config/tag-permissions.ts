import type { TagPermissions } from '@/types/tags';

export const ADMIN_TAG_PERMISSIONS: TagPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canCreate: true,
};

export const VENDOR_TAG_PERMISSIONS: TagPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canCreate: true,
};
