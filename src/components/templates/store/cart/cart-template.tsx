import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import EmptyState from "@/components/base/empty/empty-state";
import CartItemsList from "@/components/containers/store/cart/cart-items-list";
import CartSummary from "@/components/containers/store/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export default function CartTemplate() {
  const { items } = useCartStore();

  const cartSteps = [
    { label: "Home", href: "/" },
    { label: "Cart", isActive: true },
  ] as const;

  return (
    <div className="@container container mx-auto px-4 py-8">
      <BreadcrumbNav items={cartSteps} className="mb-4" />
      <h1 className="mt-4 font-bold text-3xl tracking-tight mb-8">YOUR CART</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12 text-muted-foreground" />}
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
          action={
            <Link to="/product">
              <Button size="lg" className="rounded-full">
                Continue Shopping
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid @5xl:grid-cols-12 gap-8">
          <div className="@5xl:col-span-8">
            <CartItemsList />
          </div>
          <div className="@5xl:col-span-4">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
