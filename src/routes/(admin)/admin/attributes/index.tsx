import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminAttributesTemplate from "@/components/templates/admin/admin-attributes-template";
import { mockAttributes } from "@/data/attributes";
import type { AttributeFormValues, AttributeItem } from "@/types/attributes";

export const Route = createFileRoute("/(admin)/admin/attributes/")({
  component: AdminAttributesPage,
});

function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<AttributeItem[]>(mockAttributes);

  const handleAddAttribute = (newAttributeData: AttributeFormValues) => {
    const now = new Date().toISOString();
    const newAttribute: AttributeItem = {
      id: Date.now().toString(),
      shopId: "1",
      name: newAttributeData.name,
      slug: newAttributeData.slug,
      type: newAttributeData.type,
      values: newAttributeData.values.map((value, index) => ({
        id: `${Date.now()}-${index}`,
        name: value.name,
        slug: value.slug,
        value: value.value,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })),
      sortOrder: attributes.length,
      isActive: true,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setAttributes([...attributes, newAttribute]);
  };

  const handleDeleteAttribute = (attribute: AttributeItem) => {
    setAttributes(
      attributes.filter((a) => a.id !== attribute.id)
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
