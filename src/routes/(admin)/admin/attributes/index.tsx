import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import AdminAttributesTemplate from '@/components/templates/admin/admin-attributes-template';
import { mockAttributes } from '@/data/attributes';
import type { Attribute, AttributeFormValues } from '@/types/attributes';

export const Route = createFileRoute('/(admin)/admin/attributes/')({
  component: AdminAttributesPage,
});

function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>(mockAttributes);

  const handleAddAttribute = (newAttributeData: AttributeFormValues) => {
    const newAttribute: Attribute = {
      id: Date.now().toString(),
      name: newAttributeData.name,
      slug: newAttributeData.slug,
      values: newAttributeData.values.map((value, index) => ({
        ...value,
        id: `${Date.now()}-${index}`,
      })),
      type: newAttributeData.type,
    };
    setAttributes([...attributes, newAttribute]);
  };

  const handleDeleteAttribute = (attributeId: string) => {
    setAttributes(
      attributes.filter((attribute) => attribute.id !== attributeId)
    );
  };

  return (
    <AdminAttributesTemplate
      attributes={attributes}
      onAddAttribute={handleAddAttribute}
      onDeleteAttribute={handleDeleteAttribute}
    />
  );
}
