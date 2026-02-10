/**
 * Stripe Payment Form
 *
 * Payment form using Stripe Elements for secure card input.
 */

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  clearCheckoutSession,
  useConfirmPayment,
} from "@/hooks/store/use-checkout";
import type { CheckoutSessionData } from "@/types/orders";

// Initialize Stripe - Replace with your publishable key from env
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

interface PaymentFormProps {
  checkoutSession: CheckoutSessionData;
  onCancel: () => void;
}

/**
 * Inner payment form component (must be inside Elements provider)
 */
function PaymentFormInner({ checkoutSession, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const confirmPayment = useConfirmPayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on our server
        await confirmPayment.mutateAsync({
          paymentIntentId: checkoutSession.paymentIntentId,
          orderIds: checkoutSession.orderIds,
        });

        // Clear checkout session
        clearCheckoutSession();

        // Navigate to order confirmation
        toast.success("Payment successful!");
        navigate({
          to: "/order-confirmation",
          search: {
            orderIds: checkoutSession.orderIds,
            paymentIntentId: checkoutSession.paymentIntentId,
          },
        });
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-muted/50 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 p-3 text-center text-destructive text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
        <Lock className="h-3 w-3" />
        <span>Your payment info is secure and encrypted</span>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${checkoutSession.totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface StripePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutSession: CheckoutSessionData | null;
}

/**
 * Payment dialog with Stripe Elements
 */
export function StripePaymentDialog({
  open,
  onOpenChange,
  checkoutSession,
}: StripePaymentDialogProps) {
  if (!checkoutSession) {
    return null;
  }

  const handleCancel = () => {
    onOpenChange(false);
    clearCheckoutSession();
    toast.info("Payment cancelled. Your order has been saved as pending.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        {/* Fixed header */}
        <div className="border-b p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Complete Your Payment</DialogTitle>
                <DialogDescription>
                  Secure payment powered by Stripe
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="h-[60vh]">
          <div className="p-6 pt-4">
            <div className="mb-4 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-semibold text-lg">
                  ${checkoutSession.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 text-muted-foreground text-xs">
                {checkoutSession.orderIds.length} order(s)
              </div>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: checkoutSession.clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "hsl(221.2 83.2% 53.3%)",
                    colorBackground: "hsl(0 0% 100%)",
                    colorText: "hsl(222.2 84% 4.9%)",
                    colorDanger: "hsl(0 84.2% 60.2%)",
                    fontFamily: "Inter, system-ui, sans-serif",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentFormInner
                checkoutSession={checkoutSession}
                onCancel={handleCancel}
              />
            </Elements>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
