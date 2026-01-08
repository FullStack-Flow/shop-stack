import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import DataTable from '@/components/base/data-table/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Order } from '@/types/orders';

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="w-20 truncate text-muted-foreground text-xs">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('orderNumber')}</div>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const customer = row.getValue('customer') as {
        name: string;
        email: string;
      };
      return (
        <div className="flex flex-col">
          <div className="font-medium">{customer.name}</div>
          <div className="text-xs text-muted-foreground">{customer.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('total')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      };
      return (
        <div className="text-sm">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const paymentStatus = row.getValue('paymentStatus') as string;
      const paymentColors = {
        paid: 'bg-green-100 text-green-800',
        unpaid: 'bg-yellow-100 text-yellow-800',
        refunded: 'bg-gray-100 text-gray-800',
      };
      return (
        <div className="text-sm">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${paymentColors[paymentStatus as keyof typeof paymentColors]}`}
          >
            {paymentStatus}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('items')}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const order = row.original;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
                    onClick={() =>
                      navigator.clipboard.writeText(order.orderNumber)
                    }
                  >
                    Copy Order #
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Cancel Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>More options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

interface AdminOrdersTableProps {
  data: Order[];
}

export function AdminOrdersTable({ data }: AdminOrdersTableProps) {
  return <DataTable columns={columns} data={data} />;
}
