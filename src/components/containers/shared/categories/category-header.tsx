import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface CategoryHeaderProps {
  onAddCategory?: () => void;
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
      {showAddButton && onAddCategory && (
        <Button onClick={onAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      )}
    </PageHeader>
  );
}
