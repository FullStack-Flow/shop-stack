import { useState } from "react";
import PageHeader from "@/components/base/common/page-header";
import type { CategoryFormValues } from "@/types/category-types";
import { AddCategoryDialog } from "./add-category-dialog";

export interface CategoryHeaderProps {
  onAddCategory?: (data: CategoryFormValues) => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function CategoryHeader({
  onAddCategory,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: CategoryHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddCategory = (data: CategoryFormValues) => {
    onAddCategory?.(data);
  };

  return (
    <PageHeader
      title="Categories"
      description={
        role === "admin"
          ? "Manage product categories across the platform"
          : "Manage your product categories and organization"
      }
      className={className}
    >
      {children}
      {showAddButton && (
        <AddCategoryDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddCategory}
          role={role}
        />
      )}
    </PageHeader>
  );
}
