import { useState } from "react";
import PageHeader from "@/components/base/common/page-header";
import type { TagFormValues } from "@/types/tag-form";
import { AddTagDialog } from "./add-tag-dialog";

export interface TagHeaderProps {
  onAddTag?: (data: TagFormValues) => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function TagHeader({
  onAddTag,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: TagHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTag = (data: TagFormValues) => {
    onAddTag?.(data);
  };

  return (
    <PageHeader
      title="Tags"
      description={
        role === "admin"
          ? "Manage platform-wide product tags and labels"
          : "Manage your product tags and labels"
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddTagDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddTag}
        />
      )}
    </PageHeader>
  );
}
