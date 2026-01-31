import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { CATEGORY_ICON_OPTIONS } from "@/lib/constants/category-icons";
import { createCategorySchema } from "@/lib/validators/category";
import type {
  CategoryFormValues,
  CategoryOption,
} from "@/types/category-types";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormValues) => void;
  categories: CategoryOption[];
  isSubmitting?: boolean;
  initialValues?: CategoryFormValues | null;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  categories,
  isSubmitting = false,
  initialValues,
}: AddCategoryDialogProps) {
  const categoryOptions: EntityFormField["selectOptions"] = [
    { label: "None (Root Category)", value: "none" },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Category Name",
      required: true,
      placeholder: "Electronics",
      autoGenerateSlug: true,
    },
    {
      name: "slug",
      label: "Slug",
      required: true,
      placeholder: "electronics (auto-generated if empty)",
      description: "URL-friendly identifier for your category",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Latest gadgets and electronic accessories",
    },
    {
      name: "parentId",
      label: "Parent Category",
      type: "select",
      placeholder: "Select parent category (Optional)",
      selectOptions: categoryOptions,
    },
    {
      name: "icon",
      label: "Icon",
      type: "select",
      placeholder: "Select an icon",
      selectOptions: CATEGORY_ICON_OPTIONS,
    },
    {
      name: "image",
      label: "Category Image",
      type: "file",
    },
  ];

  return (
    <EntityFormDialog<CategoryFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Category"
      description="Create a new product category for your shop."
      validationSchema={createCategorySchema}
      submitButtonText={{
        create: "Create Category",
        update: "Update Category",
      }}
      fields={fields}
    />
  );
}
