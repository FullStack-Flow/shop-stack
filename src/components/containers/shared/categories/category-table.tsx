import type { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import DataTable from '@/components/base/data-table/data-table';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Category, CategoryPermissions } from '@/types/category-types';

interface CategoryTableProps {
  categories: Category[];
  permissions?: CategoryPermissions;
  onDeleteCategory?: (categoryId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  onToggleStatus?: (categoryId: string, currentStatus: boolean) => void;
  className?: string;
}

export default function CategoryTable({
  categories,
  permissions = {
    canDelete: false,
    canEdit: true,
    canView: true,
    canToggleStatus: false,
  },
  onDeleteCategory,
  onEditCategory,
  onToggleStatus,
  className,
}: CategoryTableProps) {
  const columns: ColumnDef<Category>[] = [
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
        const level = row.original.level;
        const indent = level > 0 ? level * 16 : 0;

        return (
          <div className="font-medium" style={{ paddingLeft: `${indent}px` }}>
            {row.getValue('name')}
          </div>
        );
      },
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
          {row.getValue('slug')}
        </code>
      ),
    },
    {
      accessorKey: 'productCount',
      header: 'Products',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('productCount')}</Badge>
      ),
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <div className="text-muted-foreground">L{row.getValue('level')}</div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'featured',
      header: 'Featured',
      cell: ({ row }) => {
        const featured = row.getValue('featured');
        return featured ? (
          <Badge variant="outline">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {permissions.canToggleStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onToggleStatus?.(row.original.id, row.original.isActive)
                    }
                  >
                    {row.original.isActive ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.isActive ? 'Deactivate' : 'Activate'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  onClick={() => onEditCategory?.(row.original.id)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteCategory?.(row.original.id)}
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

  return (
    <DataTable columns={columns} data={categories} className={className} />
  );
}
