import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingCart } from "lucide-react";
import NotFound from "@/components/base/empty/notfound";
import CartItem from "@/components/base/store/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/store/use-cart";

export default function CartItemsList() {
  const {
    items,
    isLoading,
    updateQuantity,
    removeItem,
    isUpdating,
    isRemoving,
  } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="divide-y rounded-lg border bg-background p-6 shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 py-4">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <NotFound
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet."
        icon={<ShoppingCart className="size-10 text-muted-foreground" />}
      >
        <Link to="/">
          <Button>Start Shopping</Button>
        </Link>
      </NotFound>
    );
  }

  return (
    <div className="space-y-6">
      <div className="divide-y rounded-lg border bg-background p-6 shadow-sm">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={(itemId, quantity) => {
              updateQuantity(itemId, quantity);
            }}
            onRemove={(itemId) => {
              removeItem(itemId);
            }}
            isUpdating={isUpdating}
            isRemoving={isRemoving}
          />
        ))}
      </div>

      {(isUpdating || isRemoving) && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating cart...</span>
        </div>
      )}
    </div>
  );
}
