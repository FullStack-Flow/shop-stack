import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import { VENDOR_STATUS_OPTIONS } from "@/hooks/vendors/use-vendor-entity-fetchers";
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

export default function VendorCategoryTable({
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
        includeFeatured: true, // Based on the original file
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
