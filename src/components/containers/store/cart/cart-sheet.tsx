import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import CartItem from "@/components/base/store/cart/cart-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/store/use-cart";
import { useCartStore } from "@/lib/store/cart-store";

export default function CartSheet() {
  const {
    items,
    totalItems,
    subtotal,
    isLoading,
    updateQuantity,
    removeItem,
    isUpdating,
    isRemoving,
  } = useCart();
  const { isOpen, setIsOpen } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cart ({totalItems})</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 px-6">
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 py-4">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isCompact
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
            </ScrollArea>

            <div className="space-y-4 py-6">
              <Separator />
              <div className="space-y-1.5 px-6">
                <div className="flex justify-between font-medium text-base">
                  <span>Subtotal</span>
                  <span className="font-semibold text-2xl text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Shipping and taxes calculated at checkout.
                </p>
              </div>
              {(isUpdating || isRemoving) && (
                <div className="flex items-center justify-center gap-2 px-6 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
              <div className="grid gap-3 px-6">
                <Link to="/cart" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="lg">
                    View Cart
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <span className="font-medium text-lg text-muted-foreground">
              Your cart is empty
            </span>
            <Button variant="link" onClick={() => setIsOpen(false)}>
              Start Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
