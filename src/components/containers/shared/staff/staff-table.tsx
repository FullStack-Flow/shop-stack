import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Staff, StaffPermissions } from "@/types/staff";

interface StaffTableProps {
  staff: Staff[];
  permissions?: StaffPermissions;
  onEditStaff?: (staffId: string) => void;
  onDeleteStaff?: (staffId: string) => void;
  className?: string;
}

export default function StaffTable({
  staff,
  permissions = {
    canDelete: true,
    canEdit: true,
    canView: true,
    canCreate: true,
  },
  onEditStaff,
  onDeleteStaff,
  className,
}: StaffTableProps) {
  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={staff.avatar} alt={staff.name} />
              <AvatarFallback>
                {staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">{staff.name}</div>
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
        const role = row.getValue("role") as string;
        return <Badge variant="outline">{role}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "active" ? "default" : "secondary"}
            className={status === "active" ? "bg-green-500" : ""}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "joinedDate",
      header: "Joined Date",
      cell: ({ row }) => {
        const joinedDate = row.getValue("joinedDate") as string;
        return (
          <div className="text-muted-foreground">
            {format(joinedDate, "yyyy-MM-dd")}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const staff = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {permissions.canEdit && (
                <DropdownMenuItem onClick={() => onEditStaff?.(staff.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <DropdownMenuItem
                  onClick={() => onDeleteStaff?.(staff.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={staff} className={className} />;
}
