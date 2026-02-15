import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import type { VendorOrderResponse } from "@/types/orders";
import {
  createAdminOrderColumns,
  getSharedOrderFilters,
} from "../../shared/orders/order-table-columns";

interface AdminOrdersTableProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<VendorOrderResponse>>;
  className?: string;
  isOrderMutating?: (id: string) => boolean;
}

export function AdminOrdersTable({
  fetcher,
  className,
  isOrderMutating,
}: AdminOrdersTableProps) {
  const columns = useMemo(
    () => createAdminOrderColumns({ isOrderMutating }),
    [isOrderMutating],
  );

  const filterableColumns = useMemo(() => getSharedOrderFilters(), []);

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search orders..."
      className={className}
    />
  );
}
