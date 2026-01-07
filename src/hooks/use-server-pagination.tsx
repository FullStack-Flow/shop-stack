import { useQuery } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type {
  DataTableContext,
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";

export type UseServerPaginationOptions<TData> = {
  fetcher: (
    params: DataTableFetchParams
  ) => Promise<DataTableFetchResult<TData>>;
  initialPageSize?: number;
  context?: DataTableContext;
};

export function useServerPagination<TData>({
  fetcher,
  initialPageSize = 10,
  context,
}: UseServerPaginationOptions<TData>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const params: DataTableFetchParams = useMemo(
    () => ({
      pageIndex,
      pageSize,
      sorting,
      columnFilters,
      globalFilter,
      context,
    }),
    [pageIndex, pageSize, sorting, columnFilters, globalFilter, context]
  );

  const query = useQuery<DataTableFetchResult<TData>>({
    queryKey: ["datatable", context, params],
    queryFn: () => fetcher(params),
    // Preserve previous page data while fetching the next
    placeholderData: (prev) => prev,
  });

  const setPagination: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next =
      typeof updaterOrValue === "function"
        ? updaterOrValue({ pageIndex, pageSize })
        : updaterOrValue;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  return {
    // state
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    globalFilter,
    // setters
    setPageIndex,
    setPageSize,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
    setPagination,
    // data
    rows: query.data?.rows ?? [],
    pageCount: query.data?.pageCount ?? -1,
    total: query.data?.total ?? 0,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  } as const;
}
