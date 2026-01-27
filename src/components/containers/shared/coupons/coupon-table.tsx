import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
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
import type { Coupon, CouponPermissions } from "@/types/coupon";

interface CouponTableProps {
  coupons: Coupon[];
  permissions?: CouponPermissions;
  onDeleteCoupon?: (couponId: string) => void;
  onEditCoupon?: (couponId: string) => void;
  onToggleStatus?: (couponId: string, currentStatus: string) => void;
  className?: string;
}

export default function CouponTable({
  coupons,
  permissions = {
    canDelete: false,
    canEdit: true,
    canView: true,
    canToggleStatus: false,
  },
  onDeleteCoupon,
  onEditCoupon,
  onToggleStatus,
  className,
}: CouponTableProps) {
  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="w-20 truncate text-muted-foreground text-xs">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-mono font-semibold">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline">
            {type === "percentage"
              ? "%"
              : type === "fixed"
                ? "$"
                : "Free Shipping"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "discountAmount",
      header: "Discount",
      cell: ({ row }) => {
        const type = row.original.type;
        const amount = row.getValue("discountAmount") as number;
        return (
          <span className="font-medium">
            {type === "percentage" ? `${amount}%` : `$${amount}`}
          </span>
        );
      },
    },
    {
      accessorKey: "usageCount",
      header: "Usage",
      cell: ({ row }) => {
        const usageCount = row.getValue("usageCount") as number;
        const usageLimit = row.original.usageLimit;
        return (
          <div className="text-sm">
            {usageCount} {usageLimit ? `/ ${usageLimit}` : "(unlimited)"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants = {
          active: "default",
          expired: "secondary",
          inactive: "destructive",
        } as const;
        return (
          <Badge variant={variants[status as keyof typeof variants]}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "activeTo",
      header: "Expires",
      cell: ({ row }) => {
        const date = new Date(row.getValue("activeTo"));
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? "text-destructive" : ""}>
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {permissions.canToggleStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onToggleStatus?.(row.original.id, row.original.status)
              }
            >
              {row.original.status === "active" ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          )}
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
              {permissions.canView && (
                <DropdownMenuItem>View Details</DropdownMenuItem>
              )}
              {permissions.canEdit && (
                <DropdownMenuItem
                  onClick={() => onEditCoupon?.(row.original.id)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteCoupon?.(row.original.id)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={coupons} className={className} />;
}
