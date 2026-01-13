import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import DataTable from '@/components/base/data-table/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Brand, BrandPermissions } from '@/types/brands';

interface BrandTableProps {
  brands: Brand[];
  permissions?: BrandPermissions;
  onDeleteBrand?: (brandId: string) => void;
  onEditBrand?: (brandId: string) => void;
  className?: string;
}

export default function BrandTable({
  brands,
  permissions = { canDelete: false, canEdit: true, canView: true },
  onDeleteBrand,
  onEditBrand,
  className,
}: BrandTableProps) {
  const columns: ColumnDef<Brand>[] = [
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
      accessorKey: 'logo',
      header: 'Logo',
      cell: ({ row }) => (
        <Avatar className="h-9 w-9 rounded-md border">
          <AvatarImage src={row.getValue('logo')} alt={row.getValue('name')} />
          <AvatarFallback className="rounded-md uppercase">
            {row.original.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
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
      accessorKey: 'website',
      header: 'Website',
      cell: ({ row }) => {
        const website = row.getValue('website') as string | undefined;
        if (!website) return <span className="text-muted-foreground">-</span>;
        return (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            {website.replace(/^https?:\/\//, '')}
            <ExternalLink className="ml-1 size-3" />
          </a>
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
                  onClick={() => onEditBrand?.(row.original.id)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteBrand?.(row.original.id)}
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

  return <DataTable columns={columns} data={brands} className={className} />;
}
