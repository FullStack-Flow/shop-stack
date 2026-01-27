import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface BrandHeaderProps {
  onAddBrand?: () => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function BrandHeader({
  onAddBrand,
  role = "vendor",
  showAddButton = true,
  children,
  className,
}: BrandHeaderProps) {
  return (
    <PageHeader
      title="Brands"
      description={
        role === "admin"
          ? "Manage product Brands across the platform"
          : "Manage your product Brands and organization"
      }
      className={className}
    >
      {children}
      {showAddButton && onAddBrand && (
        <Button onClick={onAddBrand}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      )}
    </PageHeader>
  );
}
