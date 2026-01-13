import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/base/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/products';

interface ProductTableProps {
  products: Product[];
  className?: string;
}

export default function ProductTable({
  products,
  className,
}: ProductTableProps) {
  const columns: ColumnDef<Product>[] = [
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
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
          <img
            src={row.getValue('image') || '/placeholder.svg'}
            alt={row.getValue('name')}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue('category') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue('brand') || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.getValue('tags') as string[] | undefined;
        if (!tags || tags.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as Product['status'];
        return (
          <Badge variant={status === 'active' ? 'default' : 'destructive'}>
            {status === 'active' ? 'Active' : 'Out of Stock'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      ),
    },
  ];
  return <DataTable columns={columns} data={products} className={className} />;
}
