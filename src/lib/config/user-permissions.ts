import type { UserPermissions } from "@/types/users";

export const ADMIN_USER_PERMISSIONS: UserPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canCreate: true,
};

export const VENDOR_USER_PERMISSIONS: UserPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canCreate: false,
};
