import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
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

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  total: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  items: number;
}

interface OrderTableProps {
  orders: Order[];
  shopSlug: string;
  className?: string;
}

export default function OrderTable({
  orders,
  shopSlug,
  className,
}: OrderTableProps) {
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("orderNumber")}</div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("date")}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{customer.name}</span>
            <span className="text-muted-foreground text-xs">
              {customer.email}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Order["status"];
        return (
          <Badge
            variant={
              status === "delivered"
                ? "default"
                : status === "cancelled"
                  ? "destructive"
                  : status === "processing"
                    ? "secondary"
                    : "outline"
            }
            className="capitalize"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as Order["paymentStatus"];
        return (
          <Badge
            variant={
              status === "paid"
                ? "outline"
                : status === "refunded"
                  ? "destructive"
                  : "secondary"
            }
            className={
              status === "paid"
                ? "border-green-500 text-green-600"
                : "capitalize"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("total")}</div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("items")} items
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  to="/shop/$slug/orders/$orderId"
                  params={{ slug: shopSlug, orderId: row.original.id }}
                  className="flex w-full cursor-pointer items-center"
                >
                  <Eye className="mr-2 size-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Update Status</DropdownMenuItem>
              <DropdownMenuItem>Download Invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={orders} className={className} />;
}
