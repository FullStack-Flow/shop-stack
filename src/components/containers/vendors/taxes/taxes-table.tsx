import DataTable from "@/components/base/data-table/data-table";
import { Taxes as Tax } from "@/types/taxes";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface TaxesTableProps {
  taxes: Tax[];
}

export default function TaxesTable({ taxes }: TaxesTableProps) {
  const columns: ColumnDef<Tax>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("name")}
          </div>
        );
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        const rate = row.getValue("rate") as number;
        return (
          <Badge variant="outline">
            {rate}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        return (
          <Badge variant="outline">
            {country}
          </Badge>
        );
      },
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => {
        const state = row.getValue("state") as string;
        return (
          <div className="text-muted-foreground">
            {state || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "zip",
      header: "ZIP Code",
      cell: ({ row }) => {
        const zip = row.getValue("zip") as string;
        return (
          <div className="text-muted-foreground">
            {zip || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as number;
        return (
          <Badge variant="secondary">
            {priority}
          </Badge>
        );
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
              <DropdownMenuItem
                onClick={() => console.log("Edit tax:", tax.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("Delete tax:", tax.id)}
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

  return (
    <DataTable columns={columns} data={taxes} />
  );
}