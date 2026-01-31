import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/base/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";

interface AdminProductsTableProps {
  products: Product[];
  className?: string;
}

export default function AdminProductsTable({
  products,
  className,
}: AdminProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="w-20 truncate text-muted-foreground text-xs">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.category?.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("brand") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "price.current",
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.price;
        return (
          <div className="font-medium">
            {price.currency}
            {price.current.toFixed(2)}
            {price.discountPercentage > 0 && (
              <span className="ml-2 text-muted-foreground text-xs line-through">
                {price.currency}
                {price.original.toFixed(2)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stock.quantity",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <Badge variant={stock.inStock ? "default" : "destructive"}>
            {stock.inStock ? `${stock.quantity} in stock` : "Out of Stock"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rating.average",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">
              ({rating.count} reviews)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "store.name",
      header: "Store",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.original.store?.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "isOnSale",
      header: "Sale",
      cell: ({ row }) => {
        const isOnSale = row.getValue("isOnSale") as boolean;
        return isOnSale ? (
          <Badge variant="secondary">On Sale</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={products} className={className} />;
}
