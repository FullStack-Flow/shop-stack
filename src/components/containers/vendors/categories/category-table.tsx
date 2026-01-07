"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Camera,
  Footprints,
  Gamepad,
  Glasses,
  Headphones,
  Home,
  Laptop,
  MoreHorizontal,
  Shirt,
  Smartphone,
  Watch,
} from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Category } from "@/types/category-types";

interface CategoryTableProps {
  categories: Category[];
  className?: string;
}

const IconMap: Record<string, any> = {
  smartphone: Smartphone,
  laptop: Laptop,
  shirt: Shirt,
  home: Home,
  footprints: Footprints,
  watch: Watch,
  camera: Camera,
  headphones: Headphones,
  gamepad: Gamepad,
  glasses: Glasses,
};

export default function CategoryTable({
  categories,
  className,
}: CategoryTableProps) {
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <Avatar className="h-9 w-9 rounded-md border">
          <AvatarImage src={row.getValue("image")} alt={row.getValue("name")} />
          <AvatarFallback className="rounded-md uppercase">
            {row.original.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.icon && IconMap[row.original.icon] && (
            <div className="text-muted-foreground">
              {(() => {
                const Icon = IconMap[row.original.icon];
                return <Icon className="size-3.5" />;
              })()}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
          {row.getValue("slug")}
        </code>
      ),
    },
    {
      accessorKey: "parentId",
      header: "Parent Category",
      cell: ({ row }) => {
        const parentId = row.original.parentId;
        if (!parentId)
          return (
            <Badge variant="outline" className="text-xs">
              Root
            </Badge>
          );
        // For now, show the parent ID. In a real app, you'd look up the parent name
        return (
          <span className="text-muted-foreground text-xs">ID: {parentId}</span>
        );
      },
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("productCount")}
        </div>
      ),
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
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
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
