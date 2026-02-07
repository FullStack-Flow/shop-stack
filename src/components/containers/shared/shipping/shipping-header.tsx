import { createEntityHeader } from "@/components/base/common/entity-header";

export const ShippingHeader = createEntityHeader({
  entityName: "Shipping Method",
  entityNamePlural: "Shipping Methods",
  adminDescription:
    "Manage platform-wide shipping options and delivery methods",
  vendorDescription: "Manage your shipping options and delivery methods",
});

export default ShippingHeader;
export type { EntityHeaderProps as ShippingHeaderProps } from "@/components/base/common/entity-header";
