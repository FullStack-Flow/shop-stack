import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollectionItemProps {
  id: string;
  image: string;
  title: string;
  category: string;
  fit: string;
  price: string;
  className?: string;
  onAddToCart?: () => void;
}
export default function CollectionItem({
  id,
  image,
  title,
  category,
  fit,
  price,
  className,
  onAddToCart,
}: CollectionItemProps) {
  return (
    <div className={cn("relative border-dashed @6xl:p-7.5 p-5", className)}>
      <div className="overflow-hidden rounded-t-2xl">
        <img src={image} alt={title} className="w-full h-96.5 object-cover" />
      </div>

      <div className="@6xl:mt-7.5 mt-5 flex items-center justify-start @6xl:justify-between gap-3">
        <span className="rounded-full border-2 border-body-15 border-dashed bg-body-10 px-4 py-2 text-body-70 text-lg">
          {category}
        </span>
        <Button
          variant="secondary"
          size="lg"
          type="button"
          className="@6xl:inline-flex hidden"
          onClick={onAddToCart}
        >
          Shop Now
          <ShoppingCart />
        </Button>
      </div>
      <div className="mt-3 space-y-3.5">
        <Link to={`/product/$productId`} params={{ productId: id }}>
          <h4 className="font-medium font-mono text-lg">{title}</h4>
        </Link>
        <p className="font-mono text-muted-foreground text-sm">
          Fit: <span className="font-medium text-body-80">{fit}</span> Price:{" "}
          <span className="font-medium text-body-80">{price}</span>
        </p>
        <Button
          variant="secondary"
          size="lg"
          type="button"
          className="@6xl:hidden w-full"
          onClick={onAddToCart}
        >
          Shop Now
          <ShoppingCart />
        </Button>
      </div>
    </div>
  );
}
