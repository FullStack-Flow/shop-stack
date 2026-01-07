import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface TaxesHeaderProps {
  onAddTax: () => void;
  className?: string;
}

export default function TaxesHeader({
  onAddTax,
  className,
}: TaxesHeaderProps) {
  return (
    <PageHeader
      title="Taxes"
      description="Manage your tax rates and configurations"
      className={className}
    >
      <Button onClick={onAddTax}>
        <Plus className="mr-2 size-4" />
        Add Tax Rate
      </Button>
    </PageHeader>
  );
}