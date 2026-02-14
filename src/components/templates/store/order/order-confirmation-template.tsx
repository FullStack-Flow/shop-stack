import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import HelpSection from "@/components/base/store/order/help-section";
import { OrderDetailsCard } from "@/components/base/store/order/order-details-card";
import OrderSuccessHeader from "@/components/base/store/order/order-success-header";
import OrderInfoSection from "@/components/containers/store/order/order-info-section";
import OrderItemsList from "@/components/containers/store/order/order-items-list";
import OrderSummary from "@/components/containers/store/order/order-summary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrdersByIds } from "@/hooks/store/use-checkout";

interface OrderConfirmationTemplateProps {
  orderIds: string[];
  paymentIntentId?: string;
}

export default function OrderConfirmationTemplate({
  orderIds,
  paymentIntentId,
}: OrderConfirmationTemplateProps) {
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading,
    error,
  } = useOrdersByIds({
    orderIds,
    paymentIntentId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !orders || orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-bold text-2xl">Order not found</h2>
        <p className="text-muted-foreground">
          We couldn't find the order details you requested.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <OrderSuccessHeader />

      <div className="space-y-8">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-lg border bg-card p-0 shadow-sm"
          >
            {/* Order Header if multiple orders */}
            {orders.length > 1 && (
              <div className="border-b bg-muted/30 p-4">
                <h3 className="font-semibold text-lg">
                  Order {index + 1} of {orders.length}
                  <span className="ml-2 font-normal text-muted-foreground text-sm">
                    (Sold by {order.shopName})
                  </span>
                </h3>
              </div>
            )}

            <div className="space-y-6 p-6">
              <OrderDetailsCard
                orderId={order.id}
                orderNumber={order.orderNumber}
                orderDate={new Date(order.createdAt).toLocaleDateString()}
                estimatedDelivery="Pending confirmation" // Could be calculated
                paymentIntentId={paymentIntentId}
              />

              <OrderItemsList
                items={order.items.map((item) => ({
                  id: item.id,
                  name: item.productName,
                  image: item.productImage || "/placeholder.png", // Ensure fallback
                  price: item.unitPrice,
                  quantity: item.quantity,
                  variantOptions: item.variantOptions,
                }))}
              />

              <Separator className="my-6" />

              <OrderInfoSection
                paymentMethod={`Card ending in ...`} // TODO: get from payment details if available
                address={{
                  name: `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`,
                  street: order.shippingAddress?.street || "",
                  city: order.shippingAddress?.city || "",
                  state: order.shippingAddress?.state || "",
                  zip: order.shippingAddress?.zip || "",
                }}
                deliveryMethod={
                  order.shippingMethod === "express"
                    ? "Express Delivery"
                    : "Standard Delivery"
                }
              />

              <Separator className="my-6" />

              <div className="grid gap-6 md:grid-cols-2">
                <HelpSection />
                <OrderSummary
                  itemCost={order.subtotal}
                  shippingCost={order.shippingAmount}
                  tax={order.taxAmount}
                  couponDiscount={order.discountAmount}
                  total={order.totalAmount}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-4">
          <Button onClick={() => navigate({ to: "/" })} size="lg">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
