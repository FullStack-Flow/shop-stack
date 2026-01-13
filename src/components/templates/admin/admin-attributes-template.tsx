import AttributeHeader from '@/components/containers/shared/attributes/attribute-header';
import AttributeTable from '@/components/containers/shared/attributes/attribute-table';
import { ADMIN_ATTRIBUTE_PERMISSIONS } from '@/lib/config/attribute-permissions';
import type { Attribute, AttributeFormValues } from '@/types/attributes';

interface AdminAttributesTemplateProps {
  attributes: Attribute[];
  onAddAttribute: (data: AttributeFormValues) => void;
  onDeleteAttribute: (attributeId: string) => void;
}

export default function AdminAttributesTemplate({
  attributes,
  onAddAttribute,
  onDeleteAttribute,
}: AdminAttributesTemplateProps) {
  return (
    <div className="space-y-6">
      <AttributeHeader onAddAttribute={onAddAttribute} role="admin" />
      <AttributeTable
        attributes={attributes}
        permissions={ADMIN_ATTRIBUTE_PERMISSIONS}
        onDeleteAttribute={onDeleteAttribute}
      />
    </div>
  );
}
