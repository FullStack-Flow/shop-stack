import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface ShippingHeaderProps {
  onAddShipping: () => void;
  className?: string;
}

export default function ShippingHeader({
  onAddShipping,
  className,
}: ShippingHeaderProps) {
  return (
    <PageHeader
      title="Shipping Methods"
      description="Manage your shipping options and delivery methods"
      className={className}
    >
      <Button onClick={onAddShipping}>
        <Plus className="mr-2 size-4" />
        Add Shipping Method
      </Button>
    </PageHeader>
  );
}