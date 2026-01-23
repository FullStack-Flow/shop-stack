import { Link } from "@tanstack/react-router";
import { BarChart3, MapPin, Package, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useShops } from "@/hooks/vendors/use-shops";
import type { Shop } from "@/lib/db/schema/shop-schema";
import { cn } from "@/lib/utils";
import type { UpdateShopInput } from "@/lib/validators/shop";
import { EditShopDialog } from "./edit-shop-dialog";

interface ShopCardProps {
  shop: Shop;
  className?: string;
  canManage?: boolean;
}

export default function ShopCard({
  shop,
  className,
  canManage,
}: ShopCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { updateShop, isUpdating } = useShops();

  const handleUpdateShop = async (data: UpdateShopInput) => {
    try {
      await updateShop(data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update shop:", error);
    }
  };
  return (
    <>
      <Card className={cn("pt-0", className)}>
        <div className="relative h-32 rounded-t-xl bg-linear-to-br from-primary/20 to-primary/5">
          {shop.banner ? (
            <img
              src={shop.banner}
              alt={shop.name}
              className="h-full w-full rounded-t-xl object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-lg">
                <span className="font-bold text-2xl text-primary">
                  {shop.name.charAt(0)}
                </span>
              </div>
            </div>
          )}
          {shop.logo && (
            <div className="-bottom-8 absolute left-6 rounded-full border-4 border-background bg-background shadow-md">
              <img
                src={shop.logo}
                alt={shop.name}
                className="size-16 rounded-full object-cover"
              />
            </div>
          )}
        </div>

        <CardHeader className="space-y-2 pt-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight">
                {shop.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                {shop.description}
              </p>
            </div>
            <Badge variant={shop.status === "active" ? "default" : "secondary"}>
              {shop.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span>{shop.category || "Uncategorized"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              <span>{shop.rating}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                <Package className="size-3" />
                Products
              </div>
              <p className="mt-1 font-semibold text-sm">{shop.totalProducts}</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
                <BarChart3 className="size-3" />
                Orders
              </div>
              <p className="mt-1 font-semibold text-sm">{shop.totalOrders}</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <div className="text-muted-foreground text-xs">Revenue</div>
              <p className="mt-1 font-semibold text-sm">
                {shop.monthlyRevenue}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/shop/$slug" params={{ slug: shop.slug }}>
              View Dashboard
            </Link>
          </Button>
          {canManage && (
            <Button className="flex-1" onClick={() => setIsDialogOpen(true)}>
              Manage
            </Button>
          )}
        </CardFooter>
      </Card>

      <EditShopDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        shop={shop}
        onSubmit={handleUpdateShop}
        isSubmitting={isUpdating}
      />
    </>
  );
}
