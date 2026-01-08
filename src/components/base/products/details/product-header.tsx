import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductHeaderProps {
  title: string;
  category: {
    name: string;
    slug: string;
  };
  rating: number;
  reviewCount: number;
  isOnSale: boolean;
  className?: string;
}

export default function ProductHeader({
  title,
  category,
  rating,
  reviewCount,
  isOnSale,
  className,
}: ProductHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {isOnSale && (
        <Badge variant="destructive" className="w-fit">
          Sale
        </Badge>
      )}

      <h1 className="font-bold @2xl:text-4xl text-3xl text-foreground tracking-tight">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-1">
          <Link
            to="/category/$slug"
            params={{ slug: category.slug }}
            className="font-medium text-primary hover:underline"
          >
            {category.name}
          </Link>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-1">
          <div className="flex items-center text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.floor(rating) ? 'fill-current' : 'text-muted'
                )}
              />
            ))}
          </div>
          <span className="font-medium text-foreground">{rating}</span>
          <span>({reviewCount} reviews)</span>
        </div>
      </div>
    </div>
  );
}
