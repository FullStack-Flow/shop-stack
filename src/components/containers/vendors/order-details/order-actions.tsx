import { Download, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAdminOrderStatus } from "@/hooks/admin/use-admin-orders";
import { useDownloadInvoice } from "@/hooks/store/use-invoice";
import { useUpdateVendorOrderStatus } from "@/hooks/vendors/use-vendor-orders";
import type { OrderStatus } from "@/types/orders";

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  paymentStatus: string;
  mode?: "vendor" | "admin";
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderActions({
  orderId,
  currentStatus,
  paymentStatus,
  mode = "vendor",
}: OrderActionsProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);
  const [internalNotes, setInternalNotes] = useState("");
  const vendorUpdateStatus = useUpdateVendorOrderStatus();
  const adminUpdateStatus = useUpdateAdminOrderStatus();
  const updateStatus =
    mode === "admin" ? adminUpdateStatus : vendorUpdateStatus;
  const downloadInvoice = useDownloadInvoice();

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus && !internalNotes) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateStatus.mutateAsync({
        orderId,
        status: selectedStatus,
        internalNotes: internalNotes || undefined,
      });
      toast.success(`Order status updated to ${selectedStatus}`);
      setInternalNotes("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const isOrderFinal =
    currentStatus === "delivered" ||
    currentStatus === "cancelled" ||
    currentStatus === "refunded";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="size-5" />
          Order Actions
        </CardTitle>
        <CardDescription>
          Update order status and add internal notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Current Status:</span>
          <span className="font-medium capitalize">{currentStatus}</span>
        </div>

        <Separator />

        {/* Status Update */}
        <div className="space-y-2">
          <Label htmlFor="status">Update Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            disabled={isOrderFinal}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isOrderFinal && (
            <p className="text-muted-foreground text-xs">
              This order is in a final state and cannot be updated.
            </p>
          )}
        </div>

        {/* Internal Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add a note about this status change..."
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            disabled={isOrderFinal}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleUpdateStatus}
            disabled={updateStatus.isPending || isOrderFinal}
          >
            {updateStatus.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Update Order
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">Invoice</h4>
            <p className="text-muted-foreground text-sm">
              Download order invoice
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadInvoice.download(orderId)}
            disabled={downloadInvoice.isPending || paymentStatus !== "paid"}
          >
            {downloadInvoice.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
