import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import type { TaxRateItem } from "@/types/taxes";
import {
  createTaxTableColumns,
  type TaxMutationState,
} from "./tax-table-columns";

interface TaxTableProps {
  taxes?: TaxRateItem[];
  fetcher?: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<TaxRateItem>>;
  onDelete?: (taxRate: TaxRateItem) => void;
  onEdit?: (taxRate: TaxRateItem) => void;
  onToggleActive?: (taxRate: TaxRateItem) => void;
  isMutating?: (id: string) => boolean;
  mutationState?: TaxMutationState;
  className?: string;
  mode?: "vendor" | "customer";
}

export function TaxTable({
  taxes,
  fetcher,
  onDelete,
  onEdit,
  onToggleActive,
  isMutating,
  mutationState,
  className,
  mode = "vendor",
}: TaxTableProps) {
  const columns = useMemo(() => {
    return createTaxTableColumns({
      mode,
      actions: {
        onDelete,
        onEdit,
        onToggleActive,
      },
      mutationState,
      isMutating,
    });
  }, [mode, onDelete, onEdit, onToggleActive, mutationState, isMutating]);

  if (fetcher) {
    return (
      <DataTable
        columns={columns}
        server={{ fetcher }}
        context="shop"
        initialPageSize={10}
        globalFilterPlaceholder="Search tax rates..."
        className={className}
      />
    );
  }

  return (
    <DataTable columns={columns} data={taxes || []} className={className} />
  );
}
