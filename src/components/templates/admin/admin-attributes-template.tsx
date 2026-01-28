import { useState } from "react";
import { AddAttributeDialog } from "@/components/containers/shared/attributes/add-attribute-dialog";
import AttributeHeader from "@/components/containers/shared/attributes/attribute-header";
import AttributeTable from "@/components/containers/shared/attributes/attribute-table";
import type { AttributeFormValues, AttributeItem } from "@/types/attributes";

interface AdminAttributesTemplateProps {
  attributes: AttributeItem[];
  onAddAttribute: (data: AttributeFormValues) => void;
  onDeleteAttribute: (attribute: AttributeItem) => void;
}

export default function AdminAttributesTemplate({
  attributes,
  onAddAttribute,
  onDeleteAttribute,
}: AdminAttributesTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AttributeHeader
        onAddAttribute={() => setIsAddDialogOpen(true)}
        role="admin"
      />
      <AddAttributeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={onAddAttribute}
        role="admin"
      />
      <AttributeTable
        attributes={attributes}
        onDelete={onDeleteAttribute}
        mode="admin"
      />
    </div>
  );
}
