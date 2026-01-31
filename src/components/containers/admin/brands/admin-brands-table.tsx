import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import {
  type BrandMutationState,
  type BrandTableActions,
  createBrandColumns,
  getSharedBrandFilters,
} from "@/components/containers/shared/brands/brand-table-columns";
import type { BrandItem } from "@/types/brands";

interface AdminBrandsTableProps extends BrandTableActions {
  brands: BrandItem[];
  className?: string;
  mutationState?: BrandMutationState;
  isBrandMutating?: (id: string) => boolean;
}

export default function AdminBrandsTable({
  brands,
  className,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isBrandMutating,
}: AdminBrandsTableProps) {
  const columns: ColumnDef<BrandItem>[] = useMemo(
    () =>
      createBrandColumns({
        mode: "admin",
        actions: { onEdit, onDelete, onToggleActive },
        mutationState,
        isBrandMutating,
      }),
    [onEdit, onDelete, onToggleActive, mutationState, isBrandMutating]
  );

  const filterableColumns = useMemo(() => getSharedBrandFilters(), []);

  return (
    <DataTable
      columns={columns}
      data={brands}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search brands..."
      className={className}
    />
  );
}
