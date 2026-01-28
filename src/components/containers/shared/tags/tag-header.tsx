import { createEntityHeader } from "../entity-header";

export const TagHeader = createEntityHeader({
  entityName: "Tag",
  entityNamePlural: "Tags",
  adminDescription: "Manage tags across the platform",
  vendorDescription: "Manage your tags",
});

export default TagHeader;
export type { EntityHeaderProps as TagHeaderProps } from "../entity-header";
