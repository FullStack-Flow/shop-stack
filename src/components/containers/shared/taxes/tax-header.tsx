import { createEntityHeader } from "@/components/base/common/entity-header";

export const TaxHeader = createEntityHeader({
  entityName: "Tax Rate",
  entityNamePlural: "Tax Rates",
  adminDescription: "Manage tax rates across the platform",
  vendorDescription: "Manage your tax rates",
});

export default TaxHeader;
export type { EntityHeaderProps as TaxHeaderProps } from "@/components/base/common/entity-header";
