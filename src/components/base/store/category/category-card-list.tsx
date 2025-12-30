import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category-types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Package } from "lucide-react";

interface CategoryCardListProps {
  category: Category;
  className?: string;
  showProductCount?: boolean;
}

export default function CategoryCardList({
  category,
  className,
  showProductCount = true,
}: CategoryCardListProps) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group block"
    >
      <Card
        className={cn(
          "overflow-hidden py-0 transition-all hover:border-primary/50 hover:shadow-md",
          className
        )}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl">{category.icon}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-bold text-lg transition-colors group-hover:text-primary">
                {category.name}
              </h3>
              {category.featured && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  Featured
                </Badge>
              )}
            </div>
            {category.description && (
              <p className="mb-1 line-clamp-1 text-muted-foreground text-sm">
                {category.description}
              </p>
            )}
            {showProductCount && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Package className="h-3 w-3" />
                <span>{category.productCount} products</span>
              </div>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 text-muted-foreground group-hover:text-primary"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
