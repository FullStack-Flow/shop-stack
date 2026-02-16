import { createEntityHeader } from "@/components/base/common/entity-header";

export const UserHeader = createEntityHeader({
  entityName: "User",
  entityNamePlural: "Users",
  adminDescription: "Manage platform users and customers",
  vendorDescription: "Manage your shop's customers and users",
});

export default UserHeader;
export type { EntityHeaderProps as UserHeaderProps } from "@/components/base/common/entity-header";
