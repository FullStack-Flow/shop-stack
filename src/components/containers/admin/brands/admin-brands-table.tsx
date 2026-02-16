import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import {
  type BrandMutationState,
  type BrandTableActions,
  createBrandColumns,
  getSharedBrandFilters,
} from "@/components/containers/shared/brands/brand-table-columns";
import type { BrandItem } from "@/types/brands";

interface AdminBrandsTableProps extends BrandTableActions {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<BrandItem>>;
  className?: string;
  mutationState?: BrandMutationState;
  isBrandMutating?: (id: string) => boolean;
}

export default function AdminBrandsTable({
  fetcher,
  className,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isBrandMutating,
}: AdminBrandsTableProps) {
  const columns = useMemo(() => {
    return createBrandColumns({
      mode: "admin",
      actions: { onEdit, onDelete, onToggleActive },
      mutationState,
      isBrandMutating,
    });
  }, [onEdit, onDelete, onToggleActive, mutationState, isBrandMutating]);

  const filterableColumns = useMemo(() => getSharedBrandFilters(), []);

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search brands..."
      className={className}
    />
  );
}
