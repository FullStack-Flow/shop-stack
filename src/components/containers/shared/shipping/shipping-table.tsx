import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShippingMethod, ShippingPermissions } from "@/types/shipping";

interface ShippingTableProps {
  shippingMethods: ShippingMethod[];
  permissions?: ShippingPermissions;
  onEditShipping?: (shippingId: string) => void;
  onDeleteShipping?: (shippingId: string) => void;
  className?: string;
}

export default function ShippingTable({
  shippingMethods,
  permissions = {
    canDelete: false,
    canEdit: true,
    canView: true,
    canCreate: true,
  },
  onEditShipping,
  onDeleteShipping,
  className,
}: ShippingTableProps) {
  const columns: ColumnDef<ShippingMethod>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return <div className="font-medium">${price.toFixed(2)}</div>;
      },
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {permissions.canEdit && (
                <DropdownMenuItem
                  onClick={() => onEditShipping?.(shippingMethod.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <DropdownMenuItem
                  onClick={() => onDeleteShipping?.(shippingMethod.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable columns={columns} data={shippingMethods} className={className} />
  );
}
