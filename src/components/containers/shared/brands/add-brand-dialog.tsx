import { useForm } from "@tanstack/react-form";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
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
import { validateField, validateOptionalField } from "@/lib/helper/validators";
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
  isSubmitting: externalIsSubmitting = false,
  initialValues,
}: AddBrandDialogProps) {
  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      website: initialValues?.website ?? "",
      description: initialValues?.description ?? "",
      logo: initialValues?.logo ?? "",
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

      onSubmit(value as BrandFormValues);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Brand" : "Add New Brand"}
          </DialogTitle>
          <DialogDescription>
            Create a new product Brand for your shop.
          </DialogDescription>
        </DialogHeader>

        <Form form={form} className="space-y-4">
          <div className="grid gap-4">
            <Field
              form={form}
              name="name"
              label="Brand Name"
              onBlur={validateField(createBrandSchema.shape.name)}
              onChange={(value) => {
                if (typeof value === "string") {
                  form.setFieldValue(
                    "slug",
                    value.toLowerCase().replace(/\s+/g, "-"),
                  );
                }
              }}
              placeholder="e.g. Nike, Adidas"
              required
            />

            <Field
              form={form}
              name="slug"
              label="Slug"
              onBlur={validateField(createBrandSchema.shape.slug)}
              onChange={validateOptionalField(createBrandSchema.shape.slug)}
              placeholder="e.g. nike, adidas"
              description="URL-friendly identifier for your brand"
              required
            />

            {/* Logo Upload Field */}
            <form.Field name="logo">
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

            <Field
              form={form}
              name="website"
              label="Website"
              onBlur={validateOptionalField(createBrandSchema.shape.website)}
              onChange={validateOptionalField(createBrandSchema.shape.website)}
              placeholder="https://example.com"
            />

            <Field
              form={form}
              name="description"
              label="Description"
              onBlur={validateOptionalField(
                createBrandSchema.shape.description,
              )}
              onChange={validateOptionalField(
                createBrandSchema.shape.description,
              )}
              placeholder="Brand description..."
              as="textarea"
            />
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
                      ? "Update Brand"
                      : "Create Brand"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
