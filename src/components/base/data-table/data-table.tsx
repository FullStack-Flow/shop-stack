import type { ColumnDef } from "@tanstack/react-table";
import { useServerPagination } from "@/hooks/common/use-server-pagination";
import { DataTableContainer } from "./data-table-container";
import type { DataTableProps } from "./types";

export default function DataTable<TData, TValue>({
  columns,
  server,
  data: clientData,
  initialPageSize = 10,
  context,
  enableRowSelection,
  onRowSelectionChange,
  filterableColumns,
  toolbarTitle,
  globalFilterPlaceholder,
  className,
}: DataTableProps<TData, TValue>) {
  const isServer = !!server;

  const {
    pageIndex,
    pageSize,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    rows,
    pageCount,
    total,
    isFetching,
    refetch,
  } = useServerPagination<TData>({
    fetcher:
      server?.fetcher ??
      (async () => ({
        rows: clientData ?? [],
        pageCount: 1,
        total: clientData?.length ?? 0,
      })),
    initialPageSize,
    context,
  });

  const data = isServer ? rows : (clientData ?? []);

  return (
    <div className={className}>
      <DataTableContainer
        title={toolbarTitle}
        columns={columns as ColumnDef<TData, TValue>[]}
        data={data}
        manual={isServer}
        pageCount={isServer ? pageCount : undefined}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        filterableColumns={filterableColumns}
        globalFilterPlaceholder={globalFilterPlaceholder}
        isFetching={isFetching}
        onRefresh={isServer ? () => refetch() : undefined}
        enableRowSelection={enableRowSelection}
        onRowSelection={onRowSelectionChange}
        total={total}
      />
    </div>
  );
}
