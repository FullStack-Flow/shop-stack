import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import React from 'react';
import { DataTableCore, type DataTableInstance } from './data-table-core';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableToolbar } from './data-table-toolbar';
import type { FilterableColumn } from './types';

type TemplateProps<TData, TValue> = {
  title?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  manual?: boolean;
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
  filterableColumns?: FilterableColumn[];
  globalFilterPlaceholder?: string;
  isFetching?: boolean;
  enableRowSelection?: boolean;
  onRowSelection?: (rows: TData[]) => void;
  total?: number;
  onRefresh?: () => void;
};

export function DataTableContainer<TData, TValue>({
  title,
  columns,
  data,
  manual,
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
  filterableColumns,
  globalFilterPlaceholder,
  isFetching,
  enableRowSelection,
  onRowSelection,
  total,
  onRefresh,
}: TemplateProps<TData, TValue>) {
  // Track if we have ever loaded data (for initial skeleton vs refresh)
  const hasData = data.length > 0;
  const showSkeleton = isFetching && !hasData;

  // Capture the table instance from the core to support column visibility toggles
  const [table, setTable] = React.useState<DataTableInstance<TData> | null>(
    null
  );

  const allColumns = React.useMemo(() => {
    if (!table) {
      return columns.map((col, idx) => {
        const id = (col as any).id ?? `column_${idx}`;
        const label =
          typeof col.header === 'string' ? (col.header as string) : id;
        return { id, label, visible: true, toggle: () => {} };
      });
    }
    return table.getAllLeafColumns().map((col) => {
      const id = col.id;
      const header = col.columnDef.header;
      const label = typeof header === 'string' ? header : id;
      return {
        id,
        label,
        visible: col.getIsVisible(),
        toggle: () => col.toggleVisibility(),
      };
    });
  }, [table, columns]);

  // Handle column filter change from toolbar
  const handleColumnFilterChange = React.useCallback(
    (columnId: string, value: unknown) => {
      onColumnFiltersChange((prev) => {
        // Remove existing filter for this column
        const filtered = prev.filter((f) => f.id !== columnId);
        // Add new filter if value is not empty
        if (value !== '' && value !== undefined && value !== null) {
          filtered.push({ id: columnId, value });
        }
        return filtered;
      });
    },
    [onColumnFiltersChange]
  );

  return (
    <div className="flex w-full flex-col gap-2" aria-live="polite">
      <DataTableToolbar
        title={title}
        globalFilter={globalFilter}
        onGlobalFilterChange={onGlobalFilterChange}
        filterableColumns={filterableColumns}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        allColumns={allColumns}
        isFetching={isFetching}
        placeholder={globalFilterPlaceholder}
        onRefresh={onRefresh}
      />

      {/* Show skeleton on initial load, actual table otherwise */}
      {showSkeleton ? (
        <DataTableSkeleton
          columnCount={columns.length - 1}
          rowCount={pageSize}
          hasCheckbox={enableRowSelection}
          hasActions={true}
        />
      ) : (
        <div className="relative">
          {/* Overlay loading state for subsequent fetches */}
          {isFetching && hasData && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/50 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2 shadow-md">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-muted-foreground text-sm">
                  Loading...
                </span>
              </div>
            </div>
          )}
          <DataTableCore
            columns={columns}
            data={data}
            manual={manual}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPaginationChange={onPaginationChange}
            sorting={sorting}
            onSortingChange={onSortingChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={onGlobalFilterChange}
            enableRowSelection={enableRowSelection}
            onRowSelection={onRowSelection}
            onTableInstance={setTable}
          />
        </div>
      )}

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount ?? -1}
        total={total}
        onPageChange={onPaginationChange}
      />
    </div>
  );
}
