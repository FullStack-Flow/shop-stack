import AttributeHeader from "@/components/containers/shared/attributes/attribute-header";
import AttributeTable from "@/components/containers/shared/attributes/attribute-table";
import { VENDOR_ATTRIBUTE_PERMISSIONS } from "@/lib/config/attribute-permissions";
import type { Attribute, AttributeFormValues } from "@/types/attributes";

interface ShopAttributesTemplateProps {
  attributes: Attribute[];
  onAddAttribute?: (data: AttributeFormValues) => void;
  showAddButton?: boolean;
}

export function ShopAttributesTemplate({
  attributes,
  onAddAttribute,
  showAddButton = true,
}: ShopAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader
        onAddAttribute={onAddAttribute}
        role="vendor"
        showAddButton={showAddButton}
      />
      <AttributeTable
        attributes={attributes}
        permissions={VENDOR_ATTRIBUTE_PERMISSIONS}
      />
    </div>
  );
}
