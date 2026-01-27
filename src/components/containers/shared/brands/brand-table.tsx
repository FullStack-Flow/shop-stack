import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import type { BrandItem } from "@/types/brands";
import {
  type BrandMutationState,
  type BrandTableActions,
  createBrandColumns,
  getSharedBrandFilters,
} from "./brand-table-columns";

interface VendorBrandTableProps extends BrandTableActions {
  fetcher: (
    params: DataTableFetchParams
  ) => Promise<DataTableFetchResult<BrandItem>>;
  className?: string;
  mutationState?: BrandMutationState;
  isBrandMutating?: (id: string) => boolean;
}

export function VendorBrandTable({
  fetcher,
  className,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isBrandMutating,
}: VendorBrandTableProps) {
  const columns = useMemo(() => {
    const actions: BrandTableActions = {
      onEdit,
      onDelete,
      onToggleActive,
    };
    return createBrandColumns({
      mode: "vendor",
      actions,
      isBrandMutating,
      mutationState,
    });
  }, [onEdit, onDelete, onToggleActive, isBrandMutating, mutationState]);

  const filterableColumns = useMemo(() => getSharedBrandFilters(), []);

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="shop"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search brands..."
      className={className}
    />
  );
}
