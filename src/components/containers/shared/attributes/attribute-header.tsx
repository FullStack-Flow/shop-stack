import { createEntityHeader } from "@/components/base/common/entity-header";

export const AttributeHeader = createEntityHeader({
  entityName: "Attribute",
  entityNamePlural: "Attributes",
  adminDescription: "Manage product Attribute across the platform",
  vendorDescription: "Manage your product Attribute and organization",
  addButtonSize: "lg",
});

export default AttributeHeader;
export type { EntityHeaderProps as AttributeHeaderProps } from "@/components/base/common/entity-header";
