import { DataTableCore } from "@/components/base/data-table/data-table-core";
import { DataTablePagination } from "@/components/base/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/base/data-table/data-table-toolbar";
import { columns, type Order } from "@/components/base/store/order/columns";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import React from "react";

// Mock data
const data: Order[] = [
  {
    id: "ORD-001",
    date: "2023-10-25",
    status: "Delivered",
    total: 120.5,
    items: 3,
  },
  {
    id: "ORD-002",
    date: "2023-11-02",
    status: "Processing",
    total: 45.0,
    items: 1,
  },
  {
    id: "ORD-003",
    date: "2023-11-10",
    status: "Cancelled",
    total: 89.99,
    items: 2,
  },
  {
    id: "ORD-004",
    date: "2023-11-15",
    status: "Delivered",
    total: 250.0,
    items: 5,
  },
  {
    id: "ORD-005",
    date: "2023-11-20",
    status: "Processing",
    total: 35.5,
    items: 1,
  },
];

export default function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [_rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // We need to manually manage pagination state for the controlled component
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // We can't pass the table instance directly to DataTableCore in the current implementation
  // So we'll use the core component which handles the table instance internally
  // But wait, the DataTableCore provided in the codebase handles its own useReactTable.
  // We should pass the props it needs.

  return (
    <div className="space-y-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        allColumns={columns.map((col) => ({
          id: (col as any).accessorKey || (col as any).id,
          label: ((col as any).header as string) || (col as any).id,
          visible: true,
          toggle: () => {}, // Simplified for now as DataTableCore handles visibility internally or we need to lift state
        }))}
      />
      <DataTableCore
        columns={columns}
        data={data}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={Math.ceil(data.length / pagination.pageSize)}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableRowSelection={true}
        onRowSelection={setRowSelection}
      />
      <DataTablePagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        pageCount={Math.ceil(data.length / pagination.pageSize)}
        total={data.length}
        onPageChange={setPagination}
      />
    </div>
  );
}
