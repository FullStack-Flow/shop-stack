import { CreditCard, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  orderId: string;
  orderDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: "paid" | "unpaid" | "refunded";
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  orderId,
  orderDate,
  customer,
  paymentMethod,
  paymentStatus,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>
          Details for Order #{orderId} placed on {orderDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-muted p-2">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">Customer</p>
            <p className="text-muted-foreground text-sm">{customer.name}</p>
            <p className="text-muted-foreground text-xs">{customer.email}</p>
            <p className="text-muted-foreground text-xs">{customer.phone}</p>
          </div>
        </div>

        <Separator />

        {/* Payment Info */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-muted p-2">
            <CreditCard className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">Payment</p>
            <p className="text-muted-foreground text-sm">{paymentMethod}</p>
            <Badge
              variant={
                paymentStatus === "paid"
                  ? "outline"
                  : paymentStatus === "refunded"
                    ? "destructive"
                    : "secondary"
              }
              className={
                paymentStatus === "paid"
                  ? "border-green-500 text-green-600"
                  : "capitalize"
              }
            >
              {paymentStatus}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
