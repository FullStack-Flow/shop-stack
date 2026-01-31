import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderSearchFormProps {
  onSearch: (orderId: string) => void;
  isLoading?: boolean;
}

export default function OrderSearchForm({
  onSearch,
  isLoading = false,
}: OrderSearchFormProps) {
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      onSearch(orderId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID or Tracking Number</Label>
          <div className="flex gap-2">
            <Input
              id="orderId"
              type="text"
              placeholder="Enter your order ID (e.g., 20002455468764)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!orderId.trim() || isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Enter your order ID or tracking number to view the latest shipping
          updates
        </p>
      </div>
    </form>
  );
}
