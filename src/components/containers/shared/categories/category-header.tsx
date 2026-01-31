import { createEntityHeader } from "@/components/base/common/entity-header";

export const CategoryHeader = createEntityHeader({
  entityName: "Category",
  entityNamePlural: "Categories",
  adminDescription: "Manage product categories across the platform",
  vendorDescription: "Manage your product categories and organization",
});

export default CategoryHeader;
export type { EntityHeaderProps as CategoryHeaderProps } from "@/components/base/common/entity-header";
