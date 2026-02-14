import { Link } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItemResponse } from "@/types/cart";
import { QuantitySelector } from "../../products/details/quantity-selector";

interface CartItemProps {
  item: CartItemResponse;
  isCompact?: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export default function CartItem({
  item,
  isCompact = false,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}: CartItemProps) {
  const hasVariants =
    item.variantOptions && Object.keys(item.variantOptions).length > 0;
  const variantText = hasVariants
    ? Object.entries(item.variantOptions!)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ")
    : null;

  return (
    <div
      className={`flex gap-4 py-4 ${isCompact ? "items-start" : "items-center"} ${
        isRemoving ? "opacity-50" : ""
      }`}
    >
      <Link
        to="/product/$productId"
        params={{ productId: item.slug }}
        className={`relative overflow-hidden rounded-md border bg-muted ${
          isCompact ? "h-20 w-20" : "h-24 w-24"
        }`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex justify-between gap-2">
          <div className="space-y-1">
            <Link
              to="/product/$productId"
              params={{ productId: item.slug }}
              className="font-medium leading-none hover:underline"
            >
              {item.name}
            </Link>
            {variantText && (
              <p className="text-muted-foreground text-sm">{variantText}</p>
            )}
            <p className="text-muted-foreground text-xs">{item.shopName}</p>
          </div>
          {!isCompact && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive/90"
              onClick={() => onRemove(item.id)}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Remove item</span>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold">${item.price.toFixed(2)}</p>
            {item.regularPrice && item.regularPrice > item.price && (
              <p className="text-muted-foreground text-sm line-through">
                ${item.regularPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <QuantitySelector
                value={item.quantity}
                onChange={(value) => onUpdateQuantity(item.id, value)}
                max={item.maxQuantity}
                className="@7xl:h-9"
                size="sm"
                disabled={isUpdating}
              />
              {isCompact && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-8 w-8 text-destructive hover:text-destructive/90"
                  onClick={() => onRemove(item.id)}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Remove item</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
