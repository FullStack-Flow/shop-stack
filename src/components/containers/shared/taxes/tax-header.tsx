import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface TaxHeaderProps {
  onAddTax?: () => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function TaxHeader({
  onAddTax,
  role,
  showAddButton,
  children,
  className,
}: TaxHeaderProps) {
  return (
    <PageHeader
      title="Tax Rates"
      description={
        role === "admin"
          ? "Manage tax rates across the platform"
          : "Manage your tax rates"
      }
      className={className}
    >
      {children}
      {showAddButton && onAddTax && (
        <Button onClick={onAddTax}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tax Rate
        </Button>
      )}
    </PageHeader>
  );
}
