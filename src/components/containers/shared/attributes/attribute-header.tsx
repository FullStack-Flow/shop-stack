import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface AttributeHeaderProps {
  onAddAttribute?: () => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function AttributeHeader({
  onAddAttribute,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: AttributeHeaderProps) {
  return (
    <PageHeader
      title="Attribute"
      description={
        role === "admin"
          ? "Manage product Attribute across the platform"
          : "Manage your product Attribute and organization"
      }
      className={className}
    >
      {children}
      {showAddButton && onAddAttribute && (
        <Button onClick={onAddAttribute} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Attribute
        </Button>
      )}
    </PageHeader>
  );
}
