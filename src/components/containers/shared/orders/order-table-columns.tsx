import { Link } from "@tanstack/react-router";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { VendorOrderResponse } from "@/types/orders";

// ============================================================================
// Types
// ============================================================================

export interface OrderTableActions {
  onViewOrder?: (order: VendorOrderResponse) => void;
}

export interface OrderMutationState {
  updatingId?: string | null;
}

export interface OrderColumnConfig {
  shopSlug: string;
  actions?: OrderTableActions;
  mutationState?: OrderMutationState;
  isOrderMutating?: (id: string) => boolean;
}

export interface AdminOrderColumnConfig {
  isOrderMutating?: (id: string) => boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Refunded", value: "refunded" },
];

// ============================================================================
// Filter Configuration Factory
// ============================================================================

export const getSharedOrderFilters =
  (): FilterableColumn<VendorOrderResponse>[] => {
    return [
      {
        id: "status",
        label: "Order Status",
        type: "select",
        options: ORDER_STATUS_OPTIONS,
        placeholder: "Filter by status",
      },
      {
        id: "paymentStatus",
        label: "Payment Status",
        type: "select",
        options: PAYMENT_STATUS_OPTIONS,
        placeholder: "Filter by payment",
      },
    ];
  };

// ============================================================================
// Column Factory
// ============================================================================

/**
 * Shared column definitions for vendor order tables
 */
export const createOrderColumns = ({
  shopSlug,
  isOrderMutating,
}: OrderColumnConfig): ColumnDef<VendorOrderResponse>[] => {
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
        return (
          <div>
            <div className="font-medium">{customer?.name ?? "Guest"}</div>
            <div className="text-muted-foreground text-xs">
              {customer?.email ?? "No email"}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },

    // 3. Items Count Column
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("itemCount")}</div>
      ),
      enableSorting: true,
    },

    // 4. Order Total Column
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
      enableSorting: true,
    },

    // 5. Order Status Column
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const statusConfig: Record<
          string,
          {
            variant: "default" | "secondary" | "outline" | "destructive";
            className: string;
            label: string;
          }
        > = {
          pending: { variant: "secondary", className: "", label: "Pending" },
          confirmed: {
            variant: "secondary",
            className: "",
            label: "Confirmed",
          },
          processing: {
            variant: "outline",
            className: "",
            label: "Processing",
          },
          shipped: { variant: "outline", className: "", label: "Shipped" },
          delivered: {
            variant: "default",
            className: "bg-green-500",
            label: "Delivered",
          },
          cancelled: {
            variant: "destructive",
            className: "",
            label: "Cancelled",
          },
          refunded: {
            variant: "destructive",
            className: "",
            label: "Refunded",
          },
        };

        const config = statusConfig[status] || {
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

    // 6. Payment Status Column
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;

        const paymentConfig: Record<
          string,
          {
            variant: "default" | "secondary" | "outline" | "destructive";
            className: string;
            label: string;
          }
        > = {
          paid: {
            variant: "default",
            className: "bg-green-500",
            label: "Paid",
          },
          unpaid: { variant: "secondary", className: "", label: "Unpaid" },
          refunded: { variant: "outline", className: "", label: "Refunded" },
        };

        const config = paymentConfig[status] || {
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

    // 7. Date Column
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

    // 8. Actions Column
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const order = row.original;
        const isMutating = isOrderMutating?.(order.id) ?? false;

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

                {/* View Order Action */}
                <DropdownMenuItem asChild>
                  <Link
                    to="/shop/$slug/orders/$orderId"
                    params={{ slug: shopSlug, orderId: order.id }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
};

/**
 * Shared column definitions for admin order tables
 */
export const createAdminOrderColumns = ({
  isOrderMutating,
}: AdminOrderColumnConfig): ColumnDef<VendorOrderResponse>[] => {
  return [
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
    {
      accessorKey: "shopName",
      header: "Shop",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("shopName")}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer ?? {
          name: null,
          email: null,
        };
        return (
          <div>
            <div className="font-medium">{customer.name ?? "Guest"}</div>
            <div className="text-muted-foreground text-xs">
              {customer.email ?? "No email"}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("itemCount")}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const statusConfig: Record<
          string,
          {
            variant: "default" | "secondary" | "outline" | "destructive";
            className: string;
            label: string;
          }
        > = {
          pending: { variant: "secondary", className: "", label: "Pending" },
          confirmed: {
            variant: "secondary",
            className: "",
            label: "Confirmed",
          },
          processing: {
            variant: "outline",
            className: "",
            label: "Processing",
          },
          shipped: { variant: "outline", className: "", label: "Shipped" },
          delivered: {
            variant: "default",
            className: "bg-green-500",
            label: "Delivered",
          },
          cancelled: {
            variant: "destructive",
            className: "",
            label: "Cancelled",
          },
          refunded: {
            variant: "destructive",
            className: "",
            label: "Refunded",
          },
        };

        const config = statusConfig[status] || {
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
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;

        const paymentConfig: Record<
          string,
          {
            variant: "default" | "secondary" | "outline" | "destructive";
            className: string;
            label: string;
          }
        > = {
          paid: {
            variant: "default",
            className: "bg-green-500",
            label: "Paid",
          },
          unpaid: { variant: "secondary", className: "", label: "Unpaid" },
          refunded: { variant: "outline", className: "", label: "Refunded" },
        };

        const config = paymentConfig[status] || {
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
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const order = row.original;
        const isMutating = isOrderMutating?.(order.id) ?? false;

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
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: order.id }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
};
