import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanTable,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type CoreProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  manual?: boolean; // manual pagination/sorting/filtering for server mode
  pageCount?: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  enableRowSelection?: boolean;
  onRowSelection?: (selectedRows: TData[]) => void;
  className?: string;
  onTableInstance?: (table: TanTable<TData>) => void;
};

export function DataTableCore<TData, TValue>({
  columns,
  data,
  manual = false,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  enableRowSelection,
  onRowSelection,
  className,
  onTableInstance,
}: CoreProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: manual,
    manualSorting: manual,
    manualFiltering: manual,
    pageCount: manual ? pageCount : undefined,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
    enableRowSelection,
  });

  React.useEffect(() => {
    if (onTableInstance) onTableInstance(table);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, onTableInstance]);

  React.useEffect(() => {
    if (!onRowSelection) return;
    const selected = table
      .getSelectedRowModel()
      .rows.map((r) => r.original as TData);
    onRowSelection(selected);
  }, [table.getSelectedRowModel, onRowSelection]);

  return (
    <div
      className={cn('w-full overflow-x-auto rounded-md border', className)}
      role="region"
      aria-label="Data table"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export type DataTableInstance<TData> = TanTable<TData>;
