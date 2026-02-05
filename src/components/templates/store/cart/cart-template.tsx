import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { BreadcrumbNav } from "@/components/base/common/breadcrumb-nav";
import NotFound from "@/components/base/empty/notfound";
import CartItemsList from "@/components/containers/store/cart/cart-items-list";
import CartSummary from "@/components/containers/store/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/store/use-cart";

export default function CartTemplate() {
  const { items, isLoading } = useCart();

  const cartSteps = [
    { label: "Home", href: "/" },
    { label: "Cart", isActive: true },
  ] as const;

  return (
    <div className="@container container mx-auto px-4 py-8">
      <BreadcrumbNav items={cartSteps} className="mb-4" />
      <h1 className="mt-4 font-bold text-3xl tracking-tight mb-8">YOUR CART</h1>

      {isLoading ? (
        <div className="grid @5xl:grid-cols-12 gap-8">
          <div className="@5xl:col-span-8">
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
          </div>
          <div className="@5xl:col-span-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <Skeleton className="mb-6 h-6 w-32" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="my-4 h-px w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <NotFound
          icon={<ShoppingBag className="h-12 w-12 text-muted-foreground" />}
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
        >
          <Link to="/product">
            <Button size="lg" className="rounded-full">
              Continue Shopping
            </Button>
          </Link>
        </NotFound>
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
