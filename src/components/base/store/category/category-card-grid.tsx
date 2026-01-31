import { Link } from "@tanstack/react-router";
import { ArrowRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category-types";

interface CategoryCardGridProps {
  category: Category;
  variant?: "default" | "compact" | "featured";
  className?: string;
  showProductCount?: boolean;
}

export default function CategoryCardGrid({
  category,
  variant = "default",
  className,
  showProductCount = true,
}: CategoryCardGridProps) {
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group block h-full"
    >
      <Card
        className={cn(
          "hover:-translate-y-1 h-full overflow-hidden py-0 transition-all duration-300 hover:shadow-xl",
          isFeatured
            ? "border-primary/20 shadow-md"
            : "border-muted hover:border-primary/50",
          className
        )}
      >
        <CardContent className="flex h-full flex-col p-0">
          <div className="relative">
            {/* Category Image */}
            <div
              className={cn(
                "relative w-full overflow-hidden bg-muted",
                isCompact
                  ? "aspect-2/1"
                  : isFeatured
                    ? "aspect-video"
                    : "aspect-4/3"
              )}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary/20">
                  <span className="text-6xl">{category.icon}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {category.featured && (
                  <Badge className="bg-primary/90 shadow-sm backdrop-blur-sm hover:bg-primary">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Category Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {category.icon && !category.image && (
                  <span className="text-xl">{category.icon}</span>
                )}
                <h3
                  className={cn(
                    "font-bold transition-colors group-hover:text-primary",
                    isCompact ? "text-lg" : "text-xl"
                  )}
                >
                  {category.name}
                </h3>
              </div>
            </div>

            {!isCompact && category.description && (
              <p className="mb-4 line-clamp-2 flex-1 text-muted-foreground text-sm">
                {category.description}
              </p>
            )}

            {/* Footer info */}
            <div
              className={cn(
                "mt-auto flex items-center justify-between border-border/50 border-t pt-3",
                isCompact && "pt-2"
              )}
            >
              {showProductCount && (
                <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
                  <Package className="h-3.5 w-3.5" />
                  <span>{category.productCount} products</span>
                </div>
              )}

              <div className="-translate-x-2 flex items-center font-medium text-primary text-sm opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                Browse <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
