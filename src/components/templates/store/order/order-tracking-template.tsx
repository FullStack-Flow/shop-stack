import { AlertCircle, Package } from "lucide-react";
import OrderSearchForm from "@/components/base/store/order/order-search-form";
import OrderStatusTimeline from "@/components/base/store/order/order-status-timeline";
import OrderTrackingSummary from "@/components/containers/store/order/order-tracking-summary";
import ShippingUpdatesList from "@/components/containers/store/order/shipping-updates-list";
import TrackingDetailsCard from "@/components/containers/store/order/tracking-details-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { TrackingData } from "@/types/tracking-order";

interface OrderTrackingTemplateProps {
  onSearch: (orderId: string) => void;
  isLoading: boolean;
  data: TrackingData | null;
  error?: Error | null;
  hasSearched: boolean;
}

export default function OrderTrackingTemplate({
  onSearch,
  isLoading,
  data,
  error,
  hasSearched,
}: OrderTrackingTemplateProps) {
  return (
    <div className="@container container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 font-bold text-3xl">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order ID to get real-time tracking updates
        </p>
      </div>

      <div className="mb-8">
        <OrderSearchForm onSearch={onSearch} isLoading={isLoading} />
      </div>

      {error && (
        <div className="mx-auto mb-8 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message ||
                "Failed to find order. Please check the ID and try again."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Loading State */}
      {isLoading && hasSearched && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">
            Searching for your order...
          </p>
        </div>
      )}

      {/* No Results State */}
      {hasSearched && !isLoading && !data && !error && (
        <div className="mx-auto mb-8 max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Order Found</AlertTitle>
            <AlertDescription>
              Could not find an order with the provided ID. Please check and try
              again.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {hasSearched && data && !error && (
        <div className="space-y-8">
          {/* Status Timeline */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-6 font-semibold text-xl">Order Status</h2>
            <OrderStatusTimeline stages={data.stages} />
          </div>

          {/* Tracking Details and Summary Grid */}
          <div className="grid @5xl:grid-cols-3 gap-6">
            <div className="@5xl:col-span-2 space-y-6">
              <TrackingDetailsCard
                carrier={data.carrier}
                trackingNumber={data.trackingNumber}
                currentLocation={data.currentLocation}
                estimatedDelivery={data.estimatedDelivery}
                packageInfo={data.packageInfo}
              />
              <ShippingUpdatesList updates={data.updates} />
            </div>
            <div>
              <OrderTrackingSummary
                orderId={data.orderId}
                orderDate={data.orderDate}
                itemsCount={data.itemsCount}
                total={data.total}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
