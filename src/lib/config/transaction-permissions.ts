import type { TransactionPermissions } from "@/types/transaction";

export const ADMIN_TRANSACTION_PERMISSIONS: TransactionPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  canRefund: true,
};

export const VENDOR_TRANSACTION_PERMISSIONS: TransactionPermissions = {
  canDelete: false,
  canEdit: false,
  canView: true,
  canRefund: true,
};
