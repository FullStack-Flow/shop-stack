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
import type { Taxes as Tax, TaxPermissions } from "@/types/taxes";

interface TaxesTableProps {
  taxes: Tax[];
  permissions?: TaxPermissions;
  onEditTax?: (taxId: string) => void;
  onDeleteTax?: (taxId: string) => void;
  className?: string;
}

export default function TaxesTable({
  taxes,
  permissions = {
    canDelete: true,
    canEdit: true,
    canView: true,
    canCreate: true,
  },
  onEditTax,
  onDeleteTax,
  className,
}: TaxesTableProps) {
  const columns: ColumnDef<Tax>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const rate = row.getValue("rate") as number;
        return <Badge variant="outline">{rate}%</Badge>;
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        return <Badge variant="outline">{country}</Badge>;
      },
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => {
        const state = row.getValue("state") as string;
        return <div className="text-muted-foreground">{state || "—"}</div>;
      },
    },
    {
      accessorKey: "zip",
      header: "ZIP Code",
      cell: ({ row }) => {
        const zip = row.getValue("zip") as string;
        return <div className="text-muted-foreground">{zip || "—"}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as number;
        return <Badge variant="secondary">{priority}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tax = row.original;

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
                <DropdownMenuItem onClick={() => onEditTax?.(tax.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <DropdownMenuItem
                  onClick={() => onDeleteTax?.(tax.id)}
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

  return <DataTable columns={columns} data={taxes} className={className} />;
}
