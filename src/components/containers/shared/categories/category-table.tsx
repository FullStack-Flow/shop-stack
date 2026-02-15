import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { VENDOR_STATUS_OPTIONS } from "@/lib/constants";
import type { NormalizedCategory } from "@/types/category-types";
import {
  type CategoryMutationState,
  type CategoryTableActions,
  createCategoryColumns,
  getSharedCategoryFilters,
} from "./category-table-columns";

interface VendorCategoryTableProps extends CategoryTableActions {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<NormalizedCategory>>;
  className?: string;
  mutationState?: CategoryMutationState;
  isCategoryMutating?: (id: string) => boolean;
}

export function VendorCategoryTable({
  fetcher,
  className,
  onEdit,
  onDelete,
  mutationState,
  isCategoryMutating,
}: VendorCategoryTableProps) {
  const columns = useMemo(() => {
    const actions: CategoryTableActions = {
      onEdit,
      onDelete,
    };
    return createCategoryColumns({
      mode: "vendor",
      actions,
      isCategoryMutating,
      mutationState,
    });
  }, [onEdit, onDelete, isCategoryMutating, mutationState]);

  const filterableColumns = useMemo(
    () =>
      getSharedCategoryFilters({
        statusOptions: VENDOR_STATUS_OPTIONS,
        includeFeatured: true,
      }),
    [],
  );

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="shop"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search categories..."
      className={className}
    />
  );
}

interface AdminCategoryTableProps extends CategoryTableActions {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<NormalizedCategory>>;
  className?: string;
  mutationState?: CategoryMutationState;
  isCategoryMutating?: (id: string) => boolean;
}

export function AdminCategoryTable({
  fetcher,
  className,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  mutationState,
  isCategoryMutating,
}: AdminCategoryTableProps) {
  const columns = useMemo(() => {
    const actions: CategoryTableActions = {
      onEdit,
      onDelete,
      onToggleActive,
      onToggleFeatured,
    };
    return createCategoryColumns({
      mode: "admin",
      actions,
      isCategoryMutating,
      mutationState,
    });
  }, [
    onEdit,
    onDelete,
    onToggleActive,
    onToggleFeatured,
    isCategoryMutating,
    mutationState,
  ]);

  const filterableColumns = useMemo(
    () =>
      getSharedCategoryFilters({
        statusOptions: VENDOR_STATUS_OPTIONS,
        includeFeatured: true,
      }),
    [],
  );

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search categories..."
      className={className}
    />
  );
}

export default VendorCategoryTable;
