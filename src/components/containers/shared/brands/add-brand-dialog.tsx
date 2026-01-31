import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { createBrandSchema } from "@/lib/validators/brands";
import type { BrandFormValues } from "@/types/brands";

interface AddBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BrandFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: BrandFormValues | null;
}

export function AddBrandDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: AddBrandDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Brand Name",
      required: true,
      placeholder: "e.g. Nike, Adidas",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      required: true,
      placeholder: "e.g. nike, adidas",
      description: "URL-friendly identifier for your brand",
    },
    {
      name: "logo",
      label: "Brand Logo",
      type: "file",
    },
    {
      name: "website",
      label: "Website",
      type: "url",
      placeholder: "https://example.com",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Brand description...",
    },
  ];
  return (
    <EntityFormDialog<BrandFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Brand"
      description="Create a new product Brand for your shop."
      validationSchema={createBrandSchema}
      submitButtonText={{
        create: "Create Brand",
        update: "Update Brand",
      }}
      fields={fields}
    />
  );
}
