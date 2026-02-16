import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { VendorTransactionResponse } from "@/types/transaction";

// ============================================================================
// Types
// ============================================================================

export interface TransactionTableActions {
  onViewTransaction?: (transaction: VendorTransactionResponse) => void;
  onRefundTransaction?: (transaction: VendorTransactionResponse) => void;
}

export interface TransactionMutationState {
  refundingId?: string | null;
}

export interface TransactionColumnConfig {
  actions: TransactionTableActions;
  mutationState?: TransactionMutationState;
  isTransactionMutating?: (id: string) => boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const TRANSACTION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

// ============================================================================
// Filter Configuration Factory
// ============================================================================

export const getSharedTransactionFilters =
  (): FilterableColumn<VendorTransactionResponse>[] => {
    return [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: TRANSACTION_STATUS_OPTIONS,
        placeholder: "Filter by status",
      },
    ];
  };

// ============================================================================
// Column Factory
// ============================================================================

/**
 * Shared column definitions for vendor transaction tables
 */
export const createTransactionColumns = ({
  actions,
  mutationState,
  isTransactionMutating,
}: TransactionColumnConfig): ColumnDef<VendorTransactionResponse>[] => {
  return [
    // 1. Order Number Column
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.getValue("orderNumber")}
        </div>
      ),
      enableSorting: true,
    },

    // 2. Customer Column
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        const customerName = customer?.name ?? "Guest";
        const customerEmail = customer?.email ?? "—";
        return (
          <div>
            <div className="font-medium">{customerName}</div>
            <div className="text-muted-foreground text-xs">{customerEmail}</div>
          </div>
        );
      },
      enableSorting: false,
    },

    // 3. Amount Column
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
      enableSorting: true,
    },

    // 4. Vendor Amount (Earnings) Column
    {
      accessorKey: "vendorAmount",
      header: "Earnings",
      cell: ({ row }) => {
        const amount = row.original.vendorAmount;
        return (
          <div className="font-medium text-green-600">
            {formatCurrency(amount)}
          </div>
        );
      },
      enableSorting: true,
    },

    // 5. Platform Fee Column
    {
      accessorKey: "platformFee",
      header: "Fee",
      cell: ({ row }) => {
        const fee = row.original.platformFee;
        return (
          <div className="text-muted-foreground text-sm">
            {formatCurrency(fee)}
          </div>
        );
      },
      enableSorting: false,
    },

    // 6. Payment Method Column
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string;
        const provider = row.original.provider;
        return (
          <Badge variant="outline" className="text-xs">
            {method} ({provider})
          </Badge>
        );
      },
      enableSorting: false,
    },

    // 7. Status Column
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const statusConfig = {
          succeeded: {
            variant: "default" as const,
            className: "bg-green-500",
            label: "Paid",
          },
          pending: {
            variant: "secondary" as const,
            className: "",
            label: "Pending",
          },
          processing: {
            variant: "outline" as const,
            className: "",
            label: "Processing",
          },
          failed: {
            variant: "destructive" as const,
            className: "",
            label: "Failed",
          },
          refunded: {
            variant: "outline" as const,
            className: "",
            label: "Refunded",
          },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
          variant: "outline" as const,
          className: "",
          label: status,
        };

        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        );
      },
      enableSorting: true,
    },

    // 8. Date Column
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );
      },
      enableSorting: true,
    },

    // 9. Actions Column
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const transaction = row.original;
        const isMutating = isTransactionMutating?.(transaction.id) ?? false;
        const isRefunding = mutationState?.refundingId === transaction.id;

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
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {/* View Transaction Action */}
                {actions.onViewTransaction && (
                  <DropdownMenuItem
                    onClick={() => actions.onViewTransaction!(transaction)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}

                {/* Refund Action - Only for succeeded transactions */}
                {actions.onRefundTransaction &&
                  transaction.status === "succeeded" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          actions.onRefundTransaction!(transaction)
                        }
                        disabled={isRefunding}
                      >
                        {isRefunding ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⟳</span>
                            Refunding...
                          </span>
                        ) : (
                          "Refund"
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
