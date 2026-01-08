import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ShopAttributesTemplate } from '@/components/templates/vendor/shop-attributes-template';
import { mockAttributes } from '@/data/attributes';
import type { Attribute, AttributeFormValues } from '@/types/attributes';

export const Route = createFileRoute('/(vendor)/shop/$slug/attributes')({
  component: AttributePage,
});

function AttributePage() {
  const [attributes, setAttributes] = useState<Attribute[]>(mockAttributes);

  const handleAddAttribute = (data: AttributeFormValues) => {
    const newAttribute: Attribute = {
      id: String(attributes.length + 1),
      name: data.name,
      slug: data.slug,
      values: data.values.map((v, i) => ({
        ...v,
        id: `${attributes.length + 1}-${i}`,
      })),
      type: data.type,
    };
    setAttributes([...attributes, newAttribute]);
  };

  return (
    <ShopAttributesTemplate
      attributes={attributes}
      onAddAttribute={handleAddAttribute}
    />
  );
}
