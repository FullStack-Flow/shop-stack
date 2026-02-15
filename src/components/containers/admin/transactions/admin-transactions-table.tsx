import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableFetchParams,
  DataTableFetchResult,
  FilterableColumn,
} from "@/components/base/data-table/types";
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
import { formatCurrency } from "@/lib/utils";
import type { AdminTransactionResponse } from "@/types/transaction";

interface AdminTransactionsTableProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<AdminTransactionResponse>>;
  className?: string;
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export function AdminTransactionsTable({
  fetcher,
  className,
}: AdminTransactionsTableProps) {
  const columns = useMemo<ColumnDef<AdminTransactionResponse>[]>(() => {
    return [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => (
          <div className="font-mono text-sm font-medium">
            {row.getValue("orderNumber")}
          </div>
        ),
      },
      {
        accessorKey: "shop",
        header: "Shop",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.shop.name}</div>
            <div className="text-muted-foreground text-xs">
              {row.original.shop.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original.customer;
          return (
            <div>
              <div className="font-medium">{customer.name ?? "Guest"}</div>
              <div className="text-muted-foreground text-xs">
                {customer.email}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="font-medium">
            {formatCurrency(row.original.amount)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(transaction.id)}
                >
                  Copy Transaction ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(transaction.orderNumber)
                  }
                >
                  Copy Order Number
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="flex items-center gap-2">
                    <Eye className="size-4" />
                    View Details
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ];
  }, []);

  const filterableColumns = useMemo<
    FilterableColumn<AdminTransactionResponse>[]
  >(
    () => [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
        placeholder: "Filter by status",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search transactions..."
      className={className}
    />
  );
}
