import { Loader2, ShoppingCart, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistItemCard({
  item,
  onAddToCart,
  onRemove,
  isAdding,
  isRemoving,
}: any) {
  return (
    <div className="@container group relative flex @2xl:flex-row flex-col @2xl:items-center gap-4 rounded-lg border-muted border-b border-dashed @2xl:p-4 py-6 transition-colors last:border-0 @2xl:hover:bg-muted hover:bg-muted">
      <div className="relative aspect-square @2xl:w-24 w-full shrink-0 overflow-hidden rounded-lg border bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-none tracking-tight">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-sm">{item.shopName}</p>
          </div>
          <div className="flex @2xl:hidden flex-col items-end gap-1">
            <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
            {item.originalPrice && (
              <span className="text-muted-foreground text-xs line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {item.rating && (
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="font-medium text-sm">{item.rating}</span>
            <span className="text-muted-foreground text-xs">(120 reviews)</span>
          </div>
        )}
      </div>

      <div className="flex @2xl:w-auto w-full flex-row @2xl:flex-col @2xl:items-end items-center justify-between @2xl:gap-3 gap-4">
        <div className="@2xl:flex hidden flex-col items-end gap-0.5">
          <span className="font-bold text-xl">${item.price.toFixed(2)}</span>
          {item.originalPrice && (
            <span className="text-muted-foreground text-sm line-through">
              ${item.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex @2xl:w-auto w-full items-center gap-2">
          <Button
            size="sm"
            className="@2xl:flex-none flex-1 gap-2"
            onClick={() => onAddToCart?.(item.id)}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            Add to Cart
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove?.(item.id)}
            disabled={isRemoving}
            title="Remove from wishlist"
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
