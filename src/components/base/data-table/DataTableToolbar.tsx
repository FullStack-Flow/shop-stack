import type { FilterableColumn } from "@/components/base/data-table/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ToolbarProps<TData> = {
  title?: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filterableColumns?: FilterableColumn<TData>[];
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
  allColumns,
  isFetching,
  className,
  placeholder,
  onRefresh,
}: ToolbarProps<TData>) {
  return (
    <div
      className={cn("flex w-full items-center gap-2 px-2 py-2", className)}
      role="toolbar"
      aria-label={title ?? "Table toolbar"}
    >
      {title ? (
        <div className="font-medium text-sm" aria-hidden>
          {title}
        </div>
      ) : null}
      <Separator orientation="vertical" className="mx-2 h-6" />
      <Input
        aria-label="Search"
        placeholder={placeholder ?? "Search..."}
        value={globalFilter ?? ""}
        onChange={(e) => onGlobalFilterChange(e.currentTarget.value)}
        className="max-w-70"
      />
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Toggle columns">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-50">
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
        <Button
          variant="ghost"
          size="sm"
          disabled={isFetching}
          aria-live="polite"
          aria-busy={isFetching}
          onClick={onRefresh}
        >
          {isFetching ? "Loading…" : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
