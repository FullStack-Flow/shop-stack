import type { ReviewPermissions } from "@/types/review";

export const ADMIN_REVIEW_PERMISSIONS: ReviewPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canUpdateStatus: true,
};

export const VENDOR_REVIEW_PERMISSIONS: ReviewPermissions = {
  canDelete: false,
  canEdit: true,
  canView: true,
  canUpdateStatus: true,
};
