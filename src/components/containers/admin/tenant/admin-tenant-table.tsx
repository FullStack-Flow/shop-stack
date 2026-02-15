import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import DataTable from "@/components/base/data-table/data-table";
import type {
  DataTableServer,
  FilterableColumn,
} from "@/components/base/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminTenant } from "@/types/tenant";

interface AdminTenantTableProps {
  fetcher: DataTableServer<AdminTenant>["fetcher"];
  className?: string;
}

export default function AdminTenantTable({
  fetcher,
  className,
}: AdminTenantTableProps) {
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
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/admin/tenants/$tenantId"
                params={{ tenantId: row.original.id }}
              >
                View Details
              </Link>
            </Button>
          </div>
        ),
      },
    ];
  }, []);

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
