import AddAttributeDialog from "@/components/containers/vendors/attributes/add-attribute-dialog";
import ShopAttributesTemplate from "@/components/templates/vendor/shop-attributes-template";
import { mockAttributes } from "@/data/attributes";
import { Attribute } from "@/types/attributes";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/attributes")({
  component: AttributePage,
});

function AttributePage() {
  const [attributes, setAttributes] = useState<Attribute[]>(mockAttributes);
  const [isAddAttributeDialogOpen, setIsAddAttributeDialogOpen] =
    useState(false);

  const handleAddAttribute = () => {
    setIsAddAttributeDialogOpen(true);
  };

  const handleAddAttributeSubmit = (data: any) => {
    const newAttribute: Attribute = {
      id: String(attributes.length + 1),
      name: data.name,
      slug: data.slug,
      values: data.values.map((v: any, i: number) => ({
        ...v,
        id: `${attributes.length + 1}-${i}`,
      })),
      type: data.type,
    };
    setAttributes([...attributes, newAttribute]);
  };

  return (
    <>
      <ShopAttributesTemplate
        attributes={attributes}
        onAddAttribute={handleAddAttribute}
      />

      <AddAttributeDialog
        open={isAddAttributeDialogOpen}
        onOpenChange={setIsAddAttributeDialogOpen}
        onSubmit={handleAddAttributeSubmit}
      />
    </>
  );
}
