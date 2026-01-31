import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
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
import type { TagItem } from "@/types/tags";

export interface TagTableActions {
  onEdit?: (tag: TagItem) => void;
  onDelete?: (tag: TagItem) => void;
  onToggleActive?: (tag: TagItem) => void;
}

export interface TagMutationState {
  deletingId?: string | null;
  togglingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface TagColumnConfig {
  mode: "admin" | "vendor";
  actions: TagTableActions;
  mutationState?: TagMutationState;
  isTagMutating?: (id: string) => boolean;
}

export const TAG_STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

export const getSharedTagFilters = (): FilterableColumn<TagItem>[] => {
  return [
    {
      id: "isActive",
      label: "Status",
      type: "select",
      options: TAG_STATUS_OPTIONS,
      placeholder: "Filter by status",
    },
  ];
};

export const createTagColumns = ({
  mode,
  actions,
  mutationState,
  isTagMutating,
}: TagColumnConfig): ColumnDef<TagItem>[] => {
  const isAdmin = mode === "admin";

  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="w-20 truncate text-muted-foreground text-xs">
          {row.getValue("id")}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isMutating = isTagMutating?.(row.original.id) ?? false;
        return (
          <div className={cn("font-medium", isMutating && "opacity-60")}>
            {isMutating && (
              <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
            )}
            {row.getValue("name")}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
          {row.getValue("slug")}
        </code>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-48 truncate text-sm text-muted-foreground">
          {row.original.description || "-"}
        </div>
      ),
      enableSorting: false,
    },
    ...(isAdmin
      ? [
          {
            accessorKey: "shopName",
            header: "Shop",
            cell: ({ row }: { row: { original: TagItem } }) => (
              <div className="text-muted-foreground text-sm">
                {row.original.shopName || "-"}
              </div>
            ),
            enableSorting: false,
          },
        ]
      : []),
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => (
        <div className="text-center">
          {(row.getValue("productCount") as number) ?? 0}
        </div>
      ),
      enableSorting: true,
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
              className={cn("capitalize", isToggling && "opacity-60")}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const isMutating = isTagMutating?.(row.original.id) ?? false;
        const isDeleting = mutationState?.deletingId === row.original.id;
        const isToggling = mutationState?.togglingId === row.original.id;
        const isUpdating = mutationState?.updatingId === row.original.id;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isMutating}>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={isMutating}
                >
                  <span className="sr-only">Open menu</span>
                  {isMutating ? (
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
                    disabled={isMutating}
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

                {isAdmin && actions.onToggleActive && (
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
