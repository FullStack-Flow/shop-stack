import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

interface ProductHeaderProps {
  onAddProduct: () => void;
  className?: string;
}

export default function ProductHeader({
  className,
  onAddProduct,
}: ProductHeaderProps) {
  return (
    <PageHeader
      title="Products"
      description="Manage products across all your shops"
      className={className}
    >
      <Button onClick={onAddProduct}>
        <Plus className="mr-2 size-4" />
        Add Product
      </Button>
    </PageHeader>
  );
}
