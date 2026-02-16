import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Loader2, MoreHorizontal } from "lucide-react";
import type { FilterableColumn } from "@/components/base/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CouponItem, CouponPermissions } from "@/types/coupons";

// ============================================================================
// Types
// ============================================================================

export interface CouponTableActions {
  onEdit?: (coupon: CouponItem) => void;
  onDelete?: (coupon: CouponItem) => void;
  onToggleStatus?: (coupon: CouponItem) => void;
}

export interface CouponMutationState {
  deletingId?: string | null;
  togglingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface CouponColumnConfig {
  mode: "admin" | "vendor";
  actions: CouponTableActions;
  permissions?: CouponPermissions;
  mutationState?: CouponMutationState;
  isCouponMutating?: (id: string) => boolean;
}

// ============================================================================
// Filter Configuration Factory
// ============================================================================

export const getSharedCouponFilters = (options: {
  statusOptions: { label: string; value: string }[];
  typeOptions: { label: string; value: string }[];
}): FilterableColumn<CouponItem>[] => {
  return [
    {
      id: "isActive",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      placeholder: "Filter by status",
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      options: options.typeOptions,
      placeholder: "Filter by type",
    },
  ];
};

// ============================================================================
// Column Factory
// ============================================================================

/**
 * Shared column definitions for coupon tables (Admin & Vendor)
 */
export const createCouponColumns = ({
  mode: _mode,
  actions,
  permissions,
  mutationState,
  isCouponMutating,
}: CouponColumnConfig): ColumnDef<CouponItem>[] => {
  return [
    // 1. Code Column
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => {
        const isMutating = isCouponMutating?.(row.original.id) ?? false;
        return (
          <div
            className={cn(
              "font-mono font-semibold",
              isMutating && "opacity-60",
            )}
          >
            {isMutating && (
              <Loader2 className="mr-2 inline h-3 w-3 animate-spin" />
            )}
            {row.getValue("code")}
          </div>
        );
      },
      enableSorting: true,
    },

    // 2. Type Column
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type.replace("_", " ")}
          </Badge>
        );
      },
      enableSorting: true,
    },

    // 3. Discount Column
    {
      accessorKey: "discountAmount",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.original.type;
        const amount = row.getValue("discountAmount") as string;
        return (
          <span className="font-medium">
            {type === "percentage"
              ? `${amount}%`
              : type === "free_shipping"
                ? "Free Shipping"
                : `$${amount}`}
          </span>
        );
      },
      enableSorting: true,
    },

    // 4. Usage Column
    {
      accessorKey: "usageCount",
      header: "Usage",
      cell: ({ row }) => {
        const usageCount = row.getValue("usageCount") as number;
        const usageLimit = row.original.usageLimit;
        return (
          <div className="text-sm text-muted-foreground">
            {usageCount} {usageLimit ? `/ ${usageLimit}` : "(unlimited)"}
          </div>
        );
      },
      enableSorting: true,
    },

    // 5. Active Dates Column
    {
      accessorKey: "activeTo",
      header: "Expires",
      cell: ({ row }) => {
        const activeTo = row.getValue("activeTo") as string;
        const date = new Date(activeTo);
        const isExpired = date < new Date();
        return (
          <span
            className={cn(
              "text-sm",
              isExpired ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {date.toLocaleDateString()}
          </span>
        );
      },
      enableSorting: true,
    },

    // 6. Status Column
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isToggling = mutationState?.togglingId === row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn("capitalize", isToggling && "opacity-60")}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        );
      },
      enableSorting: true,
    },

    // 7. Actions Column
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const isMutating = isCouponMutating?.(row.original.id) ?? false;
        const isDeleting = mutationState?.deletingId === row.original.id;
        const isToggling = mutationState?.togglingId === row.original.id;

        const canEdit = permissions?.canEdit ?? true;
        const canDelete = permissions?.canDelete ?? true;
        const canToggleStatus = permissions?.canToggleStatus ?? true;

        return (
          <div className="flex justify-end gap-2">
            {canToggleStatus && actions.onToggleStatus && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => actions.onToggleStatus!(row.original)}
                disabled={isToggling || isMutating}
              >
                {isToggling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : row.original.isActive ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isMutating}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.original.id)}
                >
                  Copy ID
                </DropdownMenuItem>

                {canEdit && actions.onEdit && (
                  <DropdownMenuItem
                    onClick={() => actions.onEdit!(row.original)}
                  >
                    Edit
                  </DropdownMenuItem>
                )}

                {canDelete && actions.onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => actions.onDelete!(row.original)}
                      className="text-destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
