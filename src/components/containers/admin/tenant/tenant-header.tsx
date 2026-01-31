import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
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
import type { AdminTenantDetailsProps } from "@/types/tenant";

export default function TenantHeader({ tenant }: AdminTenantDetailsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/tenants">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="flex items-center gap-3 font-bold text-3xl tracking-tight">
            {tenant.name}
            <Badge
              variant={
                tenant.status === "active"
                  ? "default"
                  : tenant.status === "suspended"
                    ? "destructive"
                    : "secondary"
              }
              className="capitalize"
            >
              {tenant.status}
            </Badge>
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{tenant.slug}</span>
            <span>•</span>
            <span>Joined {format(tenant.joinedDate, "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">Edit Store</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View as Vendor</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Suspend Tenant
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Tenant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
