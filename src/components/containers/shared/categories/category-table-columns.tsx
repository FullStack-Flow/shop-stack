import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
import type { FilterableColumn } from "@/components/base/data-table/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { CATEGORY_ICONS } from "@/lib/constants/category-icons";
import { cn } from "@/lib/utils";
import type { NormalizedCategory } from "@/types/category-types";

// ============================================================================
// Types
// ============================================================================

export interface CategoryTableActions {
  onEdit?: (category: NormalizedCategory) => void;
  onDelete?: (category: NormalizedCategory) => void;
  onToggleActive?: (category: NormalizedCategory) => void;
  onToggleFeatured?: (category: NormalizedCategory) => void;
}

export interface CategoryMutationState {
  deletingId?: string | null;
  togglingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface CategoryColumnConfig {
  mode: "admin" | "vendor";
  actions: CategoryTableActions;
  mutationState?: CategoryMutationState;
  isCategoryMutating?: (id: string) => boolean;
}

// ============================================================================
// Filter Configuration Factory
// ============================================================================

export const getSharedCategoryFilters = (options: {
  statusOptions: { label: string; value: string }[];
  includeFeatured?: boolean;
}): FilterableColumn<NormalizedCategory>[] => {
  const filters: FilterableColumn<NormalizedCategory>[] = [
    {
      id: "isActive",
      label: "Status",
      type: "select",
      options: options.statusOptions,
      placeholder: "Filter by status",
    },
  ];

  if (options.includeFeatured) {
    filters.push({
      id: "featured",
      label: "Featured",
      type: "select",
      options: [
        { label: "Featured", value: "true" },
        { label: "Not Featured", value: "false" },
      ],
      placeholder: "Filter by featured",
    });
  }

  return filters;
};

// ============================================================================
// Column Factory
// ============================================================================

/**
 * Shared column definitions for category tables (Admin & Vendor)
 */
export const createCategoryColumns = ({
  mode,
  actions,
  mutationState,
  isCategoryMutating,
}: CategoryColumnConfig): ColumnDef<NormalizedCategory>[] => {
  const isAdmin = mode === "admin";

  return [
    // 1. Image Column
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <Avatar className="h-9 w-9 rounded-md border">
          <AvatarImage
            src={row.original.image ?? undefined}
            alt={row.original.name}
          />
          <AvatarFallback className="rounded-md uppercase">
            {(row.original.name || "CA").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ),
      enableSorting: false,
    },

    // 2. Name Column (Merged logic: includes Icon and Slug sub-text)
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isMutating = isCategoryMutating?.(row.original.id) ?? false;
        return (
          <div
            className={cn(
              "flex items-center gap-2",
              isMutating && "opacity-60"
            )}
          >
            {isMutating && <Loader2 className="h-3 w-3 animate-spin" />}
            <div>
              <span className="font-medium">{row.getValue("name")}</span>
              {row.original.icon && CATEGORY_ICONS[row.original.icon] && (
                <span className="ml-2 text-muted-foreground">
                  {(() => {
                    const Icon = CATEGORY_ICONS[row.original.icon].icon;
                    return <Icon className="inline size-3.5" />;
                  })()}
                </span>
              )}
              {/* Show slug below name - standardized for both views */}
              <div className="text-muted-foreground text-xs">
                {row.original.slug}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
    },

    // 3. Parent Category Column
    {
      accessorKey: "parentName",
      header: "Parent",
      cell: ({ row }) => {
        const parentName = row.original.parentName;
        if (!parentName)
          return (
            <Badge variant="outline" className="text-xs">
              Root
            </Badge>
          );
        return <span className="text-muted-foreground">{parentName}</span>;
      },
      enableSorting: false,
    },

    // 4. Shop Column (Admin Only)
    ...(isAdmin
      ? [
          {
            accessorKey: "shopName",
            header: "Shop",
            cell: ({ row }: { row: { original: NormalizedCategory } }) => (
              <div className="text-muted-foreground text-sm">
                {row.original.shopName || "-"}
              </div>
            ),
            enableSorting: false,
          },
        ]
      : []),

    // 5. Products Count Column
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
              {isActive ? "Active" : "Hidden"}
            </Badge>
            {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        );
      },
      enableSorting: false,
    },

    // 7. Featured Column (Admin Only)
    ...(isAdmin
      ? [
          {
            accessorKey: "featured",
            header: "Featured",
            cell: ({ row }: { row: { original: NormalizedCategory } }) => {
              const featured = row.original.featured;
              const isToggling = mutationState?.togglingId === row.original.id;

              return (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={featured ? "default" : "outline"}
                    className={cn("capitalize", isToggling && "opacity-60")}
                  >
                    {featured ? "Yes" : "No"}
                  </Badge>
                  {isToggling && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              );
            },
            enableSorting: false,
          },
        ]
      : []),

    // 8. Actions Column
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const isMutating = isCategoryMutating?.(row.original.id) ?? false;
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

                {/* 1. Edit Action */}
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

                {/* 2. Admin Specific: Toggle Active */}
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

                {/* 3. Admin Specific: Toggle Featured */}
                {isAdmin && actions.onToggleFeatured && (
                  <DropdownMenuItem
                    onClick={() => actions.onToggleFeatured!(row.original)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </span>
                    ) : row.original.featured ? (
                      "Remove Featured"
                    ) : (
                      "Mark Featured"
                    )}
                  </DropdownMenuItem>
                )}

                {/* 4. Delete Action */}
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
