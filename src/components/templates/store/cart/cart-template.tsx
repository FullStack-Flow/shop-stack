import EmptyState from "@/components/base/empty/empty-state";
import CartItemsList from "@/components/containers/store/cart/cart-items-list";
import CartSummary from "@/components/containers/store/cart/cart-summary";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export default function CartTemplate() {
  const { items } = useCartStore();

  return (
    <div className="@container container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-4 font-bold text-3xl tracking-tight uppercase">
          Your Cart
        </h1>
      </div>

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
