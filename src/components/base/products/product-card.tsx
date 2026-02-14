import { Link } from "@tanstack/react-router";
import { Eye, Loader2, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/store/use-cart";
import { useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";
import type { DisplayProduct } from "@/types/store-types";
import { ColorSwatch } from "./color-redio-item";
import PriceTag from "./price-tag";

interface ProductCardProps {
  product: DisplayProduct;
  className?: string;
  variant?: "grid" | "list";
}

export default function ProductCard({
  product,
  className,
  variant = "grid",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { setIsOpen } = useCartStore();
  const [isAddingThis, setIsAddingThis] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation();
    setIsAddingThis(true);
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
      });
      setIsOpen(true); // Open cart sheet after successful addition
      toast.success("Added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingThis(false);
    }
  };
  return (
    <div
      className={cn(
        "group relative flex rounded-xl border-2 border-muted border-dashed p-4 transition-colors hover:border-primary/50",
        variant === "grid" ? "flex-col" : "@2xl:flex-row flex-col gap-6",
        className,
      )}
    >
      {/* Image Section */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted",
          variant === "grid"
            ? "aspect-square w-full"
            : "aspect-square @2xl:w-48 w-full shrink-0",
        )}
      >
        <img
          src={product.images[0].url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.price.discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600">
              -{product.price.discountPercentage}%
            </Badge>
          )}
          {product.isNew && product.price.discountPercentage === 0 && (
            <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
          )}
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/20 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg transition-transform hover:scale-110"
            title="Quick View"
          >
            <Eye className="h-5 w-5" />
            <span className="sr-only">Quick View</span>
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg transition-transform hover:scale-110"
            title="Add to Cart"
            onClick={handleAddToCart}
            disabled={isAddingThis}
          >
            {isAddingThis ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          variant === "grid" ? "mt-4 gap-3" : "gap-4 py-2",
        )}
      >
        {/* Top Row: Category & Rating */}
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-muted-foreground/30 border-dashed bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-xs">
            {product.category.name}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium text-sm">
              {product.rating.average}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({product.rating.count})
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <Link
            to="/product/$productId"
            params={{ productId: product.id }}
            className="group/title"
          >
            <h3
              className="line-clamp-1 font-medium font-mono text-lg transition-colors group-hover/title:text-primary"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
          {variant === "list" && (
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Colors */}
        <div
          className={cn(
            "flex items-center justify-between border-muted border-t border-dashed",
            variant === "grid" ? "pt-3" : "mt-auto pt-4",
          )}
        >
          <div className="font-mono text-muted-foreground text-sm">
            <span className="font-medium text-base text-foreground">
              <PriceTag
                price={product.price.current}
                originalPrice={product.price.original}
              />
            </span>
          </div>

          <div className="flex items-center gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <ColorSwatch key={color} color={color} className="h-4 w-4" />
            ))}
            {product.colors.length > 3 && (
              <span className="ml-1 font-medium text-[10px] text-muted-foreground">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
