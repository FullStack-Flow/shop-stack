import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import type { TagItem } from "@/types/tags";
import {
  createTagColumns,
  getSharedTagFilters,
  type TagMutationState,
  type TagTableActions,
} from "./tag-table-columns";

interface TagTableProps extends TagTableActions {
  tags?: TagItem[];
  fetcher?: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<TagItem>>;
  mutationState?: TagMutationState;
  isTagMutating?: (id: string) => boolean;
  className?: string;
  mode?: "admin" | "vendor";
}

export default function TagTable({
  tags,
  fetcher,
  onEdit,
  onDelete,
  onToggleActive,
  mutationState,
  isTagMutating,
  className,
  mode = "vendor",
}: TagTableProps) {
  const columns = useMemo(() => {
    const actions: TagTableActions = {
      onEdit,
      onDelete,
      onToggleActive,
    };
    return createTagColumns({
      mode,
      actions,
      isTagMutating,
      mutationState,
    });
  }, [onEdit, onDelete, onToggleActive, isTagMutating, mutationState, mode]);

  const filterableColumns = useMemo(() => getSharedTagFilters(), []);

  if (fetcher) {
    return (
      <DataTable
        columns={columns}
        server={{ fetcher }}
        context="shop"
        initialPageSize={10}
        filterableColumns={filterableColumns}
        globalFilterPlaceholder="Search tags..."
        className={className}
      />
    );
  }

  return (
    <DataTable columns={columns} data={tags || []} className={className} />
  );
}
