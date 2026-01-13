import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import DataTable from '@/components/base/data-table/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User, UserPermissions } from '@/types/users';

interface UserTableProps {
  users: User[];
  permissions?: UserPermissions;
  onDeleteUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
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
  onEditUser,
  className,
}: UserTableProps) {
  const columns: ColumnDef<User>[] = [
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">{user.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">{row.getValue('email')}</div>
        );
      },
    },
    {
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {row.getValue('totalOrders')}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {row.getValue('totalSpent')}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={
              status === 'active'
                ? 'default'
                : status === 'suspended'
                  ? 'destructive'
                  : 'secondary'
            }
            className={status === 'active' ? 'bg-green-500' : ''}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as Date;
        return (
          <div className="text-muted-foreground">
            {format(createdAt, 'yyyy-MM-dd')}
          </div>
        );
      },
    },
    {
      id: 'actions',
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
              {permissions.canView && (
                <DropdownMenuItem>View Details</DropdownMenuItem>
              )}
              {permissions.canEdit && (
                <DropdownMenuItem onClick={() => onEditUser?.(row.original.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteUser?.(row.original.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
