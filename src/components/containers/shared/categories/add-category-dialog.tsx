import { useForm } from "@tanstack/react-form";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { Form } from "@/components/base/forms/form";
import { Field } from "@/components/base/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel, Field as UIField } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_ICON_OPTIONS } from "@/lib/constants/category-icons";
import { validateField, validateOptionalField } from "@/lib/helper/validators";
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
  isSubmitting: externalIsSubmitting = false,
  initialValues,
}: AddCategoryDialogProps) {
  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      description: initialValues?.description ?? "",
      image: initialValues?.image ?? (null as string | null),
      icon: initialValues?.icon ?? "",
      parentId: initialValues?.parentId ?? "none",
    },
    onSubmit: async ({ value, formApi }) => {
      await formApi.validateAllFields("blur");
      await formApi.validateAllFields("change");

      const hasErrors = Object.values(formApi.state.fieldMeta).some(
        (meta) => meta?.errors && meta.errors.length > 0,
      );

      if (hasErrors) {
        return;
      }

      onSubmit(value);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new product category for your shop.
          </DialogDescription>
        </DialogHeader>

        <Form form={form} className="space-y-6">
          <div className="grid gap-4">
            <Field
              form={form}
              name="name"
              label="Category Name"
              onBlur={validateField(createCategorySchema.shape.name)}
              onChange={(value) => {
                if (typeof value === "string") {
                  form.setFieldValue(
                    "slug",
                    value.toLowerCase().replace(/\s+/g, "-"),
                  );
                }
              }}
              placeholder="Electronics"
              required
            />

            <Field
              form={form}
              name="slug"
              label="Slug"
              onBlur={validateField(createCategorySchema.shape.slug)}
              onChange={validateOptionalField(createCategorySchema.shape.slug)}
              placeholder="electronics (auto-generated if empty)"
              description="URL-friendly identifier for your category"
              required
            />

            <Field
              form={form}
              name="description"
              label="Description"
              onBlur={validateOptionalField(
                createCategorySchema.shape.description,
              )}
              onChange={validateOptionalField(
                createCategorySchema.shape.description,
              )}
              placeholder="Latest gadgets and electronic accessories"
              as="textarea"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Parent Category Select */}
              <form.Field name="parentId">
                {(field) => {
                  return (
                    <UIField>
                      <FieldLabel htmlFor={field.name}>
                        Parent Category
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select parent category (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </UIField>
                  );
                }}
              </form.Field>

              {/* Icon Select */}
              <form.Field name="icon">
                {(field) => {
                  return (
                    <UIField>
                      <FieldLabel htmlFor={field.name}>Icon</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_ICON_OPTIONS.map((iconOption) => (
                            <SelectItem
                              key={iconOption.value}
                              value={iconOption.value}
                            >
                              <div className="flex items-center gap-2">
                                <iconOption.icon className="size-4" />
                                <span>{iconOption.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </UIField>
                  );
                }}
              </form.Field>
            </div>

            {/* Image Field */}
            <form.Field name="image">
              {(field) => {
                return (
                  <UIField>
                    <FieldLabel htmlFor={field.name}>Category Image</FieldLabel>
                    <FileUploaderRegular
                      pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                      classNameUploader="uc-auto uc-purple"
                      gridShowFileNames
                      sourceList="local, gdrive"
                      className="uc-auto uc-purple"
                      imgOnly
                      multiple={false}
                      filesViewMode="grid"
                      onFileUploadSuccess={(e: any) => {
                        if (e?.cdnUrl) {
                          field.handleChange(e.cdnUrl);
                        }
                      }}
                    />
                  </UIField>
                );
              }}
            </form.Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="lg"
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || externalIsSubmitting}
                  size="lg"
                >
                  {isSubmitting || externalIsSubmitting
                    ? initialValues
                      ? "Updating..."
                      : "Creating..."
                    : initialValues
                      ? "Update Category"
                      : "Create Category"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
