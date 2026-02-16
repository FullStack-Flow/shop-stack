import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Loader2, MoreHorizontal, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableServer,
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
import { useAdminShops } from "@/hooks/admin/use-admin-shops";
import type { AdminTenant } from "@/types/tenant";

interface AdminTenantTableProps {
  fetcher: DataTableServer<AdminTenant>["fetcher"];
  className?: string;
}

export default function AdminTenantTable({
  fetcher,
  className,
}: AdminTenantTableProps) {
  const { updateStatus, isUpdatingStatus } = useAdminShops();
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null);

  const handleUpdateStatus = useCallback(
    async (tenantId: string, status: AdminTenant["status"]) => {
      setUpdatingTenantId(tenantId);
      try {
        await updateStatus({ id: tenantId, status });
      } finally {
        setUpdatingTenantId(null);
      }
    },
    [updateStatus],
  );

  const columns = useMemo<ColumnDef<AdminTenant>[]>(() => {
    return [
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
        accessorKey: "name",
        header: "Store Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-muted-foreground text-xs">
              {row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-sm">
              {row.getValue("ownerName")}
            </div>
            <div className="text-muted-foreground text-xs">
              {row.original.ownerEmail}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const plan = row.getValue("plan") as AdminTenant["plan"];
          return (
            <Badge variant="outline" className="capitalize">
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as AdminTenant["status"];
          return (
            <Badge
              variant={
                status === "active"
                  ? "default"
                  : status === "suspended"
                    ? "destructive"
                    : "secondary"
              }
              className="capitalize"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "productCount",
        header: "Products",
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("productCount")}</div>
        ),
      },
      {
        accessorKey: "joinedDate",
        header: "Joined",
        cell: ({ row }) => (
          <div className="text-muted-foreground text-xs">
            {new Date(row.getValue("joinedDate")).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const tenant = row.original;
          const isRowUpdating =
            isUpdatingStatus && updatingTenantId === tenant.id;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isRowUpdating}>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    disabled={isRowUpdating}
                  >
                    <span className="sr-only">Open menu</span>
                    {isRowUpdating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="size-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin/tenants/$tenantId"
                      params={{ tenantId: tenant.id }}
                      className="w-full cursor-pointer"
                    >
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {tenant.status !== "active" && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(tenant.id, "active")}
                      disabled={isRowUpdating}
                    >
                      <span className="flex items-center gap-2">
                        <Check className="size-4" />
                        Approve
                      </span>
                    </DropdownMenuItem>
                  )}
                  {tenant.status !== "suspended" && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleUpdateStatus(tenant.id, "suspended")}
                      disabled={isRowUpdating}
                    >
                      <span className="flex items-center gap-2">
                        <X className="size-4" />
                        Reject
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
  }, [handleUpdateStatus, isUpdatingStatus, updatingTenantId]);

  const filterableColumns = useMemo<FilterableColumn<AdminTenant>[]>(() => {
    return [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
          { label: "Pending", value: "pending" },
        ],
      },
    ];
  }, []);

  return (
    <DataTable
      columns={columns}
      server={{ fetcher }}
      context="admin"
      initialPageSize={10}
      filterableColumns={filterableColumns}
      globalFilterPlaceholder="Search tenants..."
      className={className}
    />
  );
}
