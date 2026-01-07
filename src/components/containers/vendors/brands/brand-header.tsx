import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BrandHeaderProps {
  onAddBrand: () => void;
  className?: string;
}

export default function BrandHeader({
  onAddBrand,
  className,
}: BrandHeaderProps) {
  return (
    <PageHeader
      title="Brands"
      description="Manage the brands associated with your shop"
      className={className}
    >
      <Button onClick={onAddBrand}>
        <Plus className="mr-2 size-4" />
        Add Brand
      </Button>
    </PageHeader>
  );
}
