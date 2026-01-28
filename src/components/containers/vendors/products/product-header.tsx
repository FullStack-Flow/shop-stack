import { createEntityHeader } from "@/components/base/common/entity-header";

export const ProductHeader = createEntityHeader({
  entityName: "Product",
  entityNamePlural: "Products",
  adminDescription: "Manage products across the platform",
  vendorDescription: "Manage your products",
});

export default ProductHeader;
export type { EntityHeaderProps as ProductHeaderProps } from "@/components/base/common/entity-header";
