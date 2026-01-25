import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

export type DataTableContext = "shop" | "admin" | "tenant";

export type DataTableFetchParams = {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter?: string;
  context?: DataTableContext;
};

export type DataTableFetchResult<TData> = {
  rows: TData[];
  pageCount: number; // total number of pages
  total: number; // total number of rows
};

export interface DataTableServer<TData> {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<TData>>;
}

export type FilterType = "text" | "number" | "date" | "boolean" | "select";

export interface FilterableColumn<_TData> {
  id: string; // must match a ColumnDef accessorKey or id
  label: string;
  type: FilterType;
  options?: Array<{ label: string; value: string }>; // for select filters
  placeholder?: string;
  /** Optional function to convert UI value to server filter */
  toFilterValue?: (value: unknown) => unknown;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  /**
   * When provided, the table runs in server mode with manual pagination,
   * sorting and filtering. `data` becomes optional.
   */
  server?: DataTableServer<TData>;
  data?: TData[];
  initialPageSize?: number;
  context?: DataTableContext;
  /** Enable row selection with a checkbox column */
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  /** Toolbar configuration */
  filterableColumns?: FilterableColumn<TData>[];
  toolbarTitle?: string;
  globalFilterPlaceholder?: string;
  /** Styling */
  className?: string;
}

export interface DataTableState {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}
