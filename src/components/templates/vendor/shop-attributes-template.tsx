import AttributeHeader from "@/components/containers/vendors/attributes/attribute-header";
import AttributeTable from "@/components/containers/vendors/attributes/attributes-table";
import { Attribute } from "@/types/attributes";

interface ShopAttributesTemplateProps {
  attributes: Attribute[];
  onAddAttribute: () => void;
}

export default function ShopAttributesTemplate({
  attributes,
  onAddAttribute,
}: ShopAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader onAddAttribute={onAddAttribute} />
      <AttributeTable attributes={attributes} />
    </div>
  );
}
