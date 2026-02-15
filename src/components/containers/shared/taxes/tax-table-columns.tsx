import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
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
import type { TaxRateItem } from "@/types/taxes";

export interface TaxTableActions {
  onEdit?: (taxRate: TaxRateItem) => void;
  onDelete?: (taxRate: TaxRateItem) => void;
  onToggleActive?: (taxRate: TaxRateItem) => void;
}

export interface TaxMutationState {
  deletingId?: string | null;
  togglingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface TaxColumnConfig {
  mode: "vendor" | "customer" | "admin";
  actions: TaxTableActions;
  mutationState?: TaxMutationState;
  isMutating?: (id: string) => boolean;
}

export const createTaxTableColumns = ({
  mode,
  actions,
  mutationState,
  isMutating,
}: TaxColumnConfig): ColumnDef<TaxRateItem>[] => {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isBusy = isMutating?.(row.original.id) ?? false;
        return (
          <div className={cn("font-medium", isBusy && "opacity-60")}>
            {isBusy && <Loader2 className="inline h-3 w-3 animate-spin mr-1" />}
            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => <div>{row.original.rate}%</div>,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => <div>{row.original.country}</div>,
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => <div>{row.original.state || "-"}</div>,
    },
    {
      accessorKey: "zip",
      header: "ZIP",
      cell: ({ row }) => <div>{row.original.zip || "-"}</div>,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <div>{row.original.priority}</div>,
    },
    {
      accessorKey: "isCompound",
      header: "Compound",
      cell: ({ row }) => (
        <Badge variant={row.original.isCompound ? "default" : "secondary"}>
          {row.original.isCompound ? "Yes" : "No"}
        </Badge>
      ),
    },
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
              className={cn(isToggling && "opacity-60")}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const isBusy = isMutating?.(row.original.id) ?? false;
        const isDeleting = mutationState?.deletingId === row.original.id;
        const isToggling = mutationState?.togglingId === row.original.id;
        const isUpdating = mutationState?.updatingId === row.original.id;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isBusy}>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={isBusy}
                >
                  <span className="sr-only">Open menu</span>
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.original.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {actions.onEdit && (
                  <DropdownMenuItem
                    onClick={() => actions.onEdit!(row.original)}
                    disabled={isBusy}
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Edit"
                    )}
                  </DropdownMenuItem>
                )}

                {(mode === "vendor" || mode === "admin") &&
                  actions.onToggleActive && (
                    <DropdownMenuItem
                      onClick={() => actions.onToggleActive!(row.original)}
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Updating...
                        </span>
                      ) : row.original.isActive ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </DropdownMenuItem>
                  )}

                {actions.onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => actions.onDelete!(row.original)}
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
      enableSorting: false,
    },
  ];
};
