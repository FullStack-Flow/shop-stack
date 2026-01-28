import { RefreshCw } from "lucide-react";
import type { FilterableColumn } from "@/components/base/data-table/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ToolbarProps<TData> = {
  title?: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filterableColumns?: FilterableColumn<TData>[];
  columnFilters: { id: string; value: unknown }[];
  onColumnFilterChange: (columnId: string, value: unknown) => void;
  /** Column visibility toggles */
  allColumns: {
    id: string;
    label: string;
    visible: boolean;
    toggle: () => void;
  }[];
  isFetching?: boolean;
  className?: string;
  placeholder?: string;
  onRefresh?: () => void;
};

export function DataTableToolbar<TData>({
  title,
  globalFilter,
  onGlobalFilterChange,
  filterableColumns,
  columnFilters,
  onColumnFilterChange,
  allColumns,
  isFetching,
  className,
  placeholder,
  onRefresh,
}: ToolbarProps<TData>) {
  // Get current filter value for a column
  const getFilterValue = (columnId: string): string => {
    const filter = columnFilters.find((f) => f.id === columnId);
    return (filter?.value as string) ?? "";
  };

  const hasFilters = filterableColumns && filterableColumns.length > 0;

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-4 py-3",
        className
      )}
      role="toolbar"
      aria-label={title ?? "Table toolbar"}
    >
      {/* Left side - Search and Filters */}
      <div className="flex flex-1 items-center gap-3">
        {/* Global Search */}
        <Input
          aria-label="Search"
          placeholder={placeholder ?? "Search..."}
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.currentTarget.value)}
          className="w-full max-w-70"
        />

        {/* Column Filters */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            {filterableColumns.map((column) => (
              <Select
                key={column.id}
                value={getFilterValue(column.id) || "all"}
                onValueChange={(value) => {
                  onColumnFilterChange(column.id, value === "all" ? "" : value);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 w-35 border-dashed",
                    getFilterValue(column.id) && "border-primary"
                  )}
                >
                  <SelectValue placeholder={column.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {column.label}</SelectItem>
                  {column.options?.map((option: { label: string; value: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Loading indicator, Column toggle, Refresh */}
      <div className="flex items-center gap-2">
        {/* Loading indicator */}
        {isFetching && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline">Loading...</span>
          </div>
        )}

        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              aria-label="Toggle columns"
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-45">
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.visible}
                onCheckedChange={col.toggle}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          disabled={isFetching}
          aria-live="polite"
          aria-busy={isFetching}
          onClick={onRefresh}
        >
          <RefreshCw
            className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
