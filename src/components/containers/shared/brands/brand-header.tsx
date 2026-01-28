import { createEntityHeader } from "@/components/base/common/entity-header";

export const BrandHeader = createEntityHeader({
  entityName: "Brand",
  entityNamePlural: "Brands",
  adminDescription: "Manage product Brands across the platform",
  vendorDescription: "Manage your product Brands and organization",
});

export default BrandHeader;
export type { EntityHeaderProps as BrandHeaderProps } from "@/components/base/common/entity-header";
