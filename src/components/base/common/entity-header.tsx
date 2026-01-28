import { Plus } from "lucide-react";
import PageHeader from "@/components/base/common/page-header";
import { Button } from "@/components/ui/button";

export interface EntityHeaderConfig {
  entityName: string;
  entityNamePlural: string;
  adminDescription?: string;
  vendorDescription?: string;
  addButtonSize?: "default" | "sm" | "lg";
}

export interface EntityHeaderProps {
  onAdd?: () => void;
  role?: "admin" | "vendor";
  showAddButton?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Factory function to create entity-specific header components.
 * Eliminates duplication across tag-header, brand-header, category-header, etc.
 *
 * @example
 * ```tsx
 * // Create a TagHeader component
 * export const TagHeader = createEntityHeader({
 *   entityName: "Tag",
 *   entityNamePlural: "Tags",
 *   adminDescription: "Manage tags across the platform",
 *   vendorDescription: "Manage your tags",
 * });
 * ```
 */
export function createEntityHeader(config: EntityHeaderConfig) {
  return function EntityHeader({
    onAdd,
    role = "vendor",
    showAddButton = true,
    children,
    className,
  }: EntityHeaderProps) {
    const description =
      role === "admin"
        ? (config.adminDescription ??
          `Manage ${config.entityNamePlural.toLowerCase()} across the platform`)
        : (config.vendorDescription ??
          `Manage your ${config.entityNamePlural.toLowerCase()}`);

    return (
      <PageHeader
        title={config.entityNamePlural}
        description={description}
        className={className}
      >
        {children}
        {showAddButton && onAdd && (
          <Button onClick={onAdd} size={config.addButtonSize}>
            <Plus className="mr-2 h-4 w-4" />
            Add {config.entityName}
          </Button>
        )}
      </PageHeader>
    );
  };
}
