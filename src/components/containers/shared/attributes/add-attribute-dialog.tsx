import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { createAttributeSchema } from "@/lib/validators/shared/attribute-query";
import type { AttributeFormValues } from "@/types/attributes";

interface AddAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttributeFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: AttributeFormValues | null;
}

export function AddAttributeDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: AddAttributeDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Attribute Name",
      required: true,
      placeholder: "e.g. Color, Size, Material",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      required: true,
      placeholder: "e.g. color, size, material",
      description: "URL-friendly identifier for your attribute",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      selectOptions: [
        { value: "select", label: "Select" },
        { value: "color", label: "Color" },
        { value: "image", label: "Image" },
        { value: "label", label: "Label" },
      ],
      description: "Determines how this attribute's values are displayed.",
    },
  ];

  return (
    <EntityFormDialog<AttributeFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Attribute"
      description={"Create a new attribute to define product variations."}
      validationSchema={createAttributeSchema}
      submitButtonText={{
        create: "Create Attribute",
        update: "Update Attribute",
      }}
      fields={fields}
    />
  );
}
