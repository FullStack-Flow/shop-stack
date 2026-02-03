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
import type { ProductItem } from "@/types/products";

export interface ProductTableActions {
  onEdit?: (product: ProductItem) => void;
  onDelete?: (product: ProductItem) => void;
  onToggleActive?: (product: ProductItem) => void;
}

export interface ProductMutationState {
  deletingId?: string | null;
  togglingId?: string | null;
  updatingId?: string | null;
  creatingId?: string | null;
}

export interface ProductColumnConfig {
  mode?: "vendor" | "customer";
  actions: ProductTableActions;
  mutationState?: ProductMutationState;
  isMutating?: (id: string) => boolean;
}

export const createProductTableColumns = ({
  mode = "vendor",
  actions,
  mutationState,
  isMutating,
}: ProductColumnConfig): ColumnDef<ProductItem>[] => {
  return [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        const primaryImage =
          product.images?.find((img) => img.isPrimary) || product.images?.[0];

        return (
          <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
            <img
              src={primaryImage?.url || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Product",
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
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.categoryName || "-"}
        </div>
      ),
    },
    {
      accessorKey: "brandName",
      header: "Brand",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.brandName || "-"}
        </div>
      ),
    },
    {
      accessorKey: "taxName",
      header: "Tax",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.taxName || "-"}
        </div>
      ),
    },
    {
      accessorKey: "tagNames",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tagNames;
        if (!tags || tags.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.original.sellingPrice);
        return <div>${Number.isNaN(price) ? "0.00" : price.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "regularPrice",
      header: "Regular Price",
      cell: ({ row }) => {
        const price = parseFloat(row.original.regularPrice || "0.00");
        return <div>${Number.isNaN(price) ? "0.00" : price.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ row }) => {
        const price = parseFloat(row.original.costPrice || "0.00");
        return <div>${Number.isNaN(price) ? "0.00" : price.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        return <div>{row.original.stock || 0}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original as any).status as ProductItem["status"];
        const isToggling = mutationState?.togglingId === row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={status === "active" ? "default" : "destructive"}
              className={cn(isToggling && "opacity-60")}
            >
              {status === "active" ? "Active" : "Out of Stock"}
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

                {mode === "vendor" && actions.onToggleActive && (
                  <DropdownMenuItem
                    onClick={() => actions.onToggleActive!(row.original)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </span>
                    ) : (row.original as any).status === "active" ? (
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
