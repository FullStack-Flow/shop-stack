import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductPriceProps {
  currentPrice: number;
  originalPrice: number;
  currency?: string;
  discountPercentage?: number;
  inStock?: boolean;
  className?: string;
}

export default function ProductPrice({
  currentPrice,
  originalPrice,
  currency,
  discountPercentage,
  inStock,
  className,
}: ProductPriceProps) {
  const hasDiscount = originalPrice > currentPrice;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline gap-3">
        <span className="font-bold text-3xl text-foreground">
          {currency}
          {currentPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">
            {currency}
            {originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {hasDiscount && (
          <span className="font-medium text-destructive text-sm">
            Save {currency}
            {(originalPrice - currentPrice).toFixed(2)} ({discountPercentage}%)
          </span>
        )}

        <Badge
          variant={inStock ? "outline" : "destructive"}
          className={cn(inStock && "border-green-500 text-green-600")}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>
    </div>
  );
}
