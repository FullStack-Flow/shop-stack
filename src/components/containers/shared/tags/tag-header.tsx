import { createEntityHeader } from "@/components/base/common/entity-header";

export const TagHeader = createEntityHeader({
  entityName: "Tag",
  entityNamePlural: "Tags",
  adminDescription: "Manage tags across the platform",
  vendorDescription: "Manage your tags",
});

export default TagHeader;
export type { EntityHeaderProps as TagHeaderProps } from "@/components/base/common/entity-header";
