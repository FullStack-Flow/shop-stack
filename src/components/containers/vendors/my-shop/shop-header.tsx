import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopHeaderProps {
  onCreateShop: () => void;
  className?: string;
  title?: string;
  description?: string;
}

export default function ShopHeader({
  onCreateShop,
  className,
  title = "My Shops",
  description = "Manage and monitor all your shops in one place",
}: ShopHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onCreateShop}>
          <Plus className="mr-2 size-4" />
          Create New Shop
        </Button>
      </div>
    </div>
  );
}
