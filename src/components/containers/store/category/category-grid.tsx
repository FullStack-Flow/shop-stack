import CategoryCard from "@/components/base/store/category/category-card";
import {
  type GridColumnsConfig,
  getGridColsClass,
  getResponsiveGridColsClass,
} from "@/lib/grid-utils";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category-types";

interface CategoryGridProps {
  categories: Category[];
  variant?: "default" | "compact" | "featured" | "list";
  columns?: GridColumnsConfig;
  className?: string;
  showProductCount?: boolean;
}

export default function CategoryGrid({
  categories,
  variant = "default",
  columns = {
    default: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
  className,
  showProductCount = true,
}: CategoryGridProps) {
  const gridClasses = cn(
    "grid gap-4",
    columns.default && getGridColsClass(columns.default),
    columns.sm && getResponsiveGridColsClass(columns.sm, "@xl"),
    columns.md && getResponsiveGridColsClass(columns.md, "@2xl"),
    columns.lg && getResponsiveGridColsClass(columns.lg, "@5xl"),
    columns.xl && getResponsiveGridColsClass(columns.xl, "@7xl"),
    className
  );
  return (
    <div className={gridClasses}>
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          variant={variant}
          showProductCount={showProductCount}
        />
      ))}
    </div>
  );
}
