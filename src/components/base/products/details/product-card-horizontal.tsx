import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/data/products';
import { cn } from '@/lib/utils';

interface ProductCardHorizontalProps {
  product: Product;
  className?: string;
}

export default function ProductCardHorizontal({
  product,
  className,
}: ProductCardHorizontalProps) {
  const mainImage = product.images[0]?.url || 'https://placehold.co/300x300';

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id }}
      className={cn(
        'group flex w-full min-w-70 max-w-[320px] flex-col gap-3 rounded-lg border bg-background p-4 transition-all hover:shadow-md',
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.isOnSale && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Sale
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-xs">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 font-medium text-foreground text-sm group-hover:text-primary">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(product.rating.average)
                    ? 'fill-current'
                    : 'text-muted'
                )}
              />
            ))}
          </div>
          <span className="text-muted-foreground text-xs">
            ({product.rating.count})
          </span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-bold text-foreground text-lg">
            {product.price.currency}
            {product.price.current.toFixed(2)}
          </span>
          {product.price.original > product.price.current && (
            <span className="text-muted-foreground text-sm line-through">
              {product.price.currency}
              {product.price.original.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
