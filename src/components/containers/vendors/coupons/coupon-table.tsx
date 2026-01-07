"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Tag, Truck, Percent, DollarSign } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Coupon } from "@/types/coupon";

interface CouponTableProps {
  coupons: Coupon[];
  className?: string;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "expired":
      return "secondary";
    case "inactive":
      return "destructive";
    default:
      return "outline";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "percentage":
      return Percent;
    case "fixed":
      return DollarSign;
    case "free_shipping":
      return Truck;
    default:
      return Tag;
  }
};

export default function CouponTable({ coupons, className }: CouponTableProps) {
  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <Avatar className="h-9 w-9 rounded-md border">
          <AvatarImage src={row.getValue("image")} alt={row.getValue("code")} />
          <AvatarFallback className="rounded-md uppercase">
            {row.original.code.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
            {row.getValue("code")}
          </code>
          {(() => {
            const Icon = getTypeIcon(row.original.type);
            return <Icon className="size-3.5 text-muted-foreground" />;
          })()}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs capitalize">
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "discountAmount",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.original.type;
        const amount = row.getValue("discountAmount");
        return (
          <div className="font-medium">
            {type === "percentage" ? `${amount}%` : `$${amount}`}
          </div>
        );
      },
    },
    {
      accessorKey: "minimumCartAmount",
      header: "Min. Amount",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          ${row.getValue("minimumCartAmount")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={getStatusBadgeVariant(row.getValue("status"))}
          className="text-xs"
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "usageCount",
      header: "Usage",
      cell: ({ row }) => {
        const usageCount = row.getValue("usageCount") as number;
        const usageLimit = row.original.usageLimit;
        return (
          <div className="text-muted-foreground text-sm">
            {usageCount}
            {usageLimit ? `/${usageLimit}` : ""}
          </div>
        );
      },
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={coupons} className={className} />;
}
