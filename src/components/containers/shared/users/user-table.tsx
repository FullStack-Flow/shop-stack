import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUser, UserPermissions, UserRole } from "@/types/users";

interface UserTableProps {
  users: AdminUser[];
  permissions?: UserPermissions;
  onDeleteUser?: (userId: string) => void;
  onBanUser?: (userId: string) => void;
  onUnbanUser?: (userId: string) => void;
  onUpdateRole?: (userId: string, role: UserRole) => void;
  className?: string;
}

export default function UserTable({
  users,
  permissions = {
    canDelete: true,
    canEdit: true,
    canView: true,
    canCreate: true,
  },
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  onUpdateRole,
  className,
}: UserTableProps) {
  const columns: ColumnDef<AdminUser>[] = [
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
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">{user.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">{row.getValue("email")}</div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {row.getValue("role")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "banned" ? "destructive" : "default"}
            className={status === "active" ? "bg-green-500" : ""}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date | string;
        const createdAtDate =
          createdAt instanceof Date ? createdAt : new Date(createdAt);
        return (
          <div className="text-muted-foreground">
            {format(createdAtDate, "yyyy-MM-dd")}
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy ID
              </DropdownMenuItem>
              {permissions.canEdit && onUpdateRole && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Update Role</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.role}
                      onValueChange={(value) =>
                        onUpdateRole(row.original.id, value as UserRole)
                      }
                    >
                      <DropdownMenuRadioItem value="customer">
                        Customer
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="vendor">
                        Vendor
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="admin">
                        Admin
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              {permissions.canEdit && row.original.status === "active" && (
                <DropdownMenuItem
                  onClick={() => onBanUser?.(row.original.id)}
                >
                  Ban User
                </DropdownMenuItem>
              )}
              {permissions.canEdit && row.original.status === "banned" && (
                <DropdownMenuItem
                  onClick={() => onUnbanUser?.(row.original.id)}
                >
                  Unban User
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteUser?.(row.original.id)}
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

  return <DataTable columns={columns} data={users} className={className} />;
}
