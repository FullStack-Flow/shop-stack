import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import type { FilterableColumn } from "@/components/base/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShippingMethodItem } from "@/types/shipping";

// ============================================================================
// Types
// ============================================================================

export interface ShippingTableActions {
  onEdit?: (shipping: ShippingMethodItem) => void;
  onDelete?: (shipping: ShippingMethodItem) => void;
}

export interface ShippingMutationState {
  deletingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface ShippingColumnConfig {
  actions: ShippingTableActions;
  mutationState?: ShippingMutationState;
  isMutating?: (id: string) => boolean;
  mode?: "vendor" | "admin";
}

// ============================================================================
// Filter Configuration Factory
// ============================================================================

export const getSharedShippingFilters = (options: {
  statusOptions: { label: string; value: string }[];
}): FilterableColumn<ShippingMethodItem>[] => {
  return [
    {
      id: "isActive",
      label: "Status",
      type: "select",
      options: options.statusOptions,
      placeholder: "Filter by status",
    },
  ];
};

export const SHIPPING_STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

// ============================================================================
// Column Factory
// ============================================================================

export const createShippingColumns = ({
  actions,
  mutationState,
  isMutating,
  mode: _mode = "vendor",
}: ShippingColumnConfig): ColumnDef<ShippingMethodItem>[] => {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price");
        const formattedPrice =
          typeof price === "number"
            ? price.toFixed(2)
            : parseFloat(price as string).toFixed(2);
        return <div className="font-medium">${formattedPrice}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const duration = row.getValue("duration") as string;
        return <Badge variant="outline">{duration}</Badge>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)));
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs truncate text-muted-foreground">
            {description || "No description"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const shippingMethod = row.original;
        const isDeleting =
          mutationState?.deletingId === shippingMethod.id ||
          isMutating?.(shippingMethod.id);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={isDeleting}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => actions.onEdit?.(shippingMethod)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onDelete?.(shippingMethod)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
