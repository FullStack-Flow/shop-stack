import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CategoryWithChildren } from "@/types/category-types";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Circle } from "lucide-react";
import { useState } from "react";

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  className?: string;
  showProductCount?: boolean;
  expandedCategories?: string[];
  onExpandedChange?: (categoryId: string, expanded: boolean) => void;
}

export default function CategoryTree({
  categories,
  className,
  showProductCount = true,
  expandedCategories = [],
  onExpandedChange,
}: CategoryTreeProps) {
  const [localExpanded, setLocalExpanded] =
    useState<string[]>(expandedCategories);
  const params = useParams({ strict: false });
  const currentSlug = (params as any).slug;

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = localExpanded.includes(categoryId)
      ? localExpanded.filter((id) => id !== categoryId)
      : [...localExpanded, categoryId];

    setLocalExpanded(newExpanded);
    onExpandedChange?.(categoryId, !localExpanded.includes(categoryId));
  };

  const renderCategory = (category: CategoryWithChildren, level = 0) => {
    const isExpanded = localExpanded.includes(category.id);
    const isActive = category.slug === currentSlug;

    const hasChildren =
      category.subcategories && category.subcategories.length > 0;

    return (
      <Collapsible
        key={category.id}
        open={isExpanded}
        onOpenChange={() => toggleExpanded(category.id)}
        className="w-full"
      >
        <div
          className={cn(
            "group relative flex items-center gap-2 rounded-md py-1.5 pr-2 transition-colors hover:bg-accent/50",
            isActive && "bg-accent font-medium",
            level > 0 && "ml-3 border-muted-foreground/50 border-l pl-3"
          )}
        >
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 shrink-0 p-0 text-muted-foreground hover:text-foreground",
                  isActive && "text-accent-foreground"
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              <Circle
                className={cn(
                  "h-1.5 w-1.5 fill-muted-foreground text-muted-foreground",
                  isActive && "fill-primary text-primary"
                )}
              />
            </div>
          )}

          <Link
            to="/category/$slug"
            params={{ slug: category.slug }}
            className="flex flex-1 items-center gap-2 overflow-hidden"
            activeProps={{ className: "font-medium text-primary" }}
          >
            <span className="flex-1 truncate text-sm">{category.name}</span>

            {showProductCount && (
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "ml-auto h-5 px-1.5 text-[10px]",
                  !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {category.productCount}
              </Badge>
            )}
          </Link>
        </div>

        <CollapsibleContent>
          {hasChildren && (
            <div className="mt-1">
              {category.subcategories.map((subcategory) =>
                renderCategory(subcategory, level + 1)
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className={cn("space-y-1", className)}>
      {categories.map((category) => renderCategory(category))}
    </div>
  );
}
