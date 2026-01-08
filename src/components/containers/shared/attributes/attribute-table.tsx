import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import DataTable from "@/components/base/data-table/data-table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Attribute,
  AttributePermissions,
  AttributeValue,
} from "@/types/attributes";

interface AttributeTableProps {
  attributes: Attribute[];
  permissions?: AttributePermissions;
  onDeleteAttribute?: (attributeId: string) => void;
  onEditAttribute?: (attributeId: string) => void;
  className?: string;
}

export default function AttributeTable({
  attributes,
  permissions = { canDelete: false, canEdit: true, canView: true },
  onDeleteAttribute,
  onEditAttribute,
  className,
}: AttributeTableProps) {
  const columns: ColumnDef<Attribute>[] = [
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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "values",
      header: "Values",
      cell: ({ row }) => {
        const values = row.getValue("values") as AttributeValue[];
        const type = row.original.type;

        return (
          <div className="flex flex-wrap gap-1">
            {values.slice(0, 5).map((val) => {
              if (type === "color") {
                return (
                  <TooltipProvider key={val.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="size-6 rounded-full border shadow-sm"
                          style={{ backgroundColor: val.value }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{val.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              if (type === "image") {
                return (
                  <TooltipProvider key={val.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="size-8 overflow-hidden rounded-md border bg-muted">
                          <img
                            src={val.value || "/placeholder.svg"}
                            alt={val.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{val.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              return (
                <Badge key={val.id} variant="secondary" className="text-xs">
                  {val.name}
                </Badge>
              );
            })}
            {values.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{values.length - 5} more
              </Badge>
            )}
          </div>
        );
      },
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
              {permissions.canView && (
                <DropdownMenuItem>View Details</DropdownMenuItem>
              )}
              {permissions.canEdit && (
                <DropdownMenuItem
                  onClick={() => onEditAttribute?.(row.original.id)}
                >
                  Edit
                </DropdownMenuItem>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteAttribute?.(row.original.id)}
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
    <DataTable columns={columns} data={attributes} className={className} />
  );
}
