import { Plus } from "lucide-react";
import ShopCard from "@/components/base/vendors/my-shop/shop-card";
import ShopHeader from "@/components/containers/vendors/my-shop/shop-header";
import { Button } from "@/components/ui/button";
import type { Shop } from "@/lib/db/schema/shop-schema";

interface MyShopsTemplateProps {
  shops: Shop[];
  onCreateShop: () => void;
  currentVendorId?: string | null;
  title?: string;
  description?: string;
}

export default function MyShopsTemplate({
  shops,
  onCreateShop,
  currentVendorId,
  title,
  description,
}: MyShopsTemplateProps) {
  return (
    <div className="space-y-6">
      <ShopHeader
        onCreateShop={onCreateShop}
        title={title}
        description={description}
      />

      {shops.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <h3 className="font-semibold text-lg">No shops found</h3>
          <p className="max-w-sm text-muted-foreground text-sm">
            You haven't created any shops yet. Create your first shop to get
            started.
          </p>
          <Button onClick={onCreateShop} className="mt-4" variant="outline">
            <Plus className="mr-2 size-4" />
            Create Shop
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              canManage={shop.vendorId === currentVendorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
