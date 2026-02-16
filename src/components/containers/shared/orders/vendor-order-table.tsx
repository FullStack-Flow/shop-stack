import { useMemo } from "react";

import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import type { VendorOrderResponse } from "@/types/orders";
import {
  createOrderColumns,
  getSharedOrderFilters,
} from "./order-table-columns";

interface VendorOrderTableProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<VendorOrderResponse>>;
  shopSlug: string;
  className?: string;
  isOrderMutating?: (id: string) => boolean;
}

export function VendorOrderTable({
  fetcher,
  shopSlug,
  className,
  isOrderMutating,
}: VendorOrderTableProps) {
  const columns = useMemo(() => {
    return createOrderColumns({
      shopSlug,
      isOrderMutating,
    });
  }, [shopSlug, isOrderMutating]);

  const filterableColumns = useMemo(() => getSharedOrderFilters(), []);

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="shop"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search orders..."
      className={className}
    />
  );
}

export default VendorOrderTable;
