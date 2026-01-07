import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AttributeHeaderProps {
  onAddAttribute: () => void;
  className?: string;
}

export default function AttributeHeader({
  onAddAttribute,
  className,
}: AttributeHeaderProps) {
  return (
    <PageHeader
      title="Attributes"
      description="Manage product attributes and variations"
      className={className}
    >
      <Button onClick={onAddAttribute}>
        <Plus className="mr-2 size-4" />
        Add Attribute
      </Button>
    </PageHeader>
  );
}
