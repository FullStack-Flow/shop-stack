import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, RefreshCcw, Trash2 } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction, TransactionPermissions } from "@/types/transaction";

interface TransactionsTableProps {
  transactions: Transaction[];
  permissions?: TransactionPermissions;
  onViewTransaction?: (transactionId: string) => void;
  onRefundTransaction?: (transactionId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  className?: string;
}

export default function TransactionsTable({
  transactions,
  permissions = {
    canDelete: false,
    canEdit: false,
    canView: true,
    canRefund: true,
  },
  onViewTransaction,
  onRefundTransaction,
  onDeleteTransaction,
  className,
}: TransactionsTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "trackingNumber",
      header: "Tracking Number",
      cell: ({ row }) => {
        const trackingNumber = row.getValue("trackingNumber") as string;
        return <div className="font-mono text-sm">{trackingNumber}</div>;
      },
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: ({ row }) => {
        const totalPrice = row.getValue("totalPrice") as string;
        return (
          <div className="font-medium">
            ${parseFloat(totalPrice).toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "paymentGateway",
      header: "Payment Gateway",
      cell: ({ row }) => {
        const gateway = row.getValue("paymentGateway") as string;
        return <Badge variant="outline">{gateway}</Badge>;
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        return (
          <Badge
            variant={
              status === "paid"
                ? "default"
                : status === "pending"
                  ? "secondary"
                  : status === "failed"
                    ? "destructive"
                    : "outline"
            }
            className={status === "paid" ? "bg-green-500" : ""}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return <div className="text-muted-foreground">{date}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
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
              {permissions.canView && (
                <DropdownMenuItem
                  onClick={() => onViewTransaction?.(transaction.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {permissions.canRefund &&
                transaction.paymentStatus === "paid" && (
                  <DropdownMenuItem
                    onClick={() => onRefundTransaction?.(transaction.id)}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refund
                  </DropdownMenuItem>
                )}
              {permissions.canDelete && (
                <DropdownMenuItem
                  onClick={() => onDeleteTransaction?.(transaction.id)}
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
    <DataTable columns={columns} data={transactions} className={className} />
  );
}
