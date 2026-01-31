import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { createTagSchema } from "@/lib/validators/shared/tag-query";
import type { TagFormValues } from "@/types/tags";

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TagFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: TagFormValues | null;
}

export function AddTagDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: AddTagDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Tag Name",
      required: true,
      placeholder: "e.g. New Arrival, Best Seller, On Sale",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      required: true,
      placeholder: "e.g. new-arrival, best-seller, on-sale",
      description: "URL-friendly identifier for your tag",
    },
    {
      name: "description",
      label: "Description",
      required: false,
      placeholder: "Optional description for this tag",
      type: "textarea",
      description: "Brief explanation of what this tag represents",
    },
  ];

  return (
    <EntityFormDialog<TagFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Tag"
      description={"Create a new tag to organize your products."}
      validationSchema={createTagSchema}
      submitButtonText={{
        create: "Create Tag",
        update: "Update Tag",
      }}
      fields={fields}
    />
  );
}
