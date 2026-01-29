import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  CouponItem,
  CouponMutationState,
  CouponPermissions,
} from "@/types/coupons";
import { ATTRIBUTE_TYPE_OPTIONS } from "../../shared/attributes/attribute-table-columns";
import {
  type CouponTableActions,
  createCouponColumns,
  getSharedCouponFilters,
} from "../../shared/coupons/coupon-table-columns";
import { TAG_STATUS_OPTIONS } from "../../shared/tags/tag-table-columns";

interface AdminCouponTableProps extends CouponTableActions {
  coupons: CouponItem[];
  className?: string;
  mutationState?: CouponMutationState;
  isCouponMutating?: (id: string) => boolean;
  permissions?: CouponPermissions;
}

export function AdminCouponTable({
  coupons,
  className,
  onEdit,
  onDelete,
  onToggleStatus,
  mutationState,
  isCouponMutating,
  permissions,
}: AdminCouponTableProps) {
  const columns = useMemo(() => {
    const actions: CouponTableActions = {
      onEdit,
      onDelete,
      onToggleStatus,
    };
    return createCouponColumns({
      mode: "admin",
      actions,
      isCouponMutating,
      mutationState,
      permissions,
    });
  }, [
    onEdit,
    onDelete,
    onToggleStatus,
    isCouponMutating,
    mutationState,
    permissions,
  ]);

  const filterableColumns = useMemo(
    () =>
      getSharedCouponFilters({
        statusOptions: TAG_STATUS_OPTIONS,
        typeOptions: ATTRIBUTE_TYPE_OPTIONS,
      }),
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={coupons}
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search coupons..."
      className={className}
    />
  );
}
