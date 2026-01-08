import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShopHeaderProps {
  onCreateShop: () => void;
  className?: string;
}

export default function ShopHeader({
  onCreateShop,
  className,
}: ShopHeaderProps) {
  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">My Shops</h2>
          <p className="text-muted-foreground">
            Manage and monitor all your shops in one place
          </p>
        </div>
        <Button onClick={onCreateShop}>
          <Plus className="mr-2 size-4" />
          Create New Shop
        </Button>
      </div>
    </div>
  );
}
