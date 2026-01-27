import { useForm } from "@tanstack/react-form";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import type { z } from "zod";
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
import { validateField, validateOptionalField } from "@/lib/helper/validators";

export interface EntityFormField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "file" | "select";
  required?: boolean;
  placeholder?: string;
  description?: string;
  autoGenerateSlug?: boolean;
  selectOptions?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface EntityFormDialogProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: T) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<T> | null;
  title: string;
  description: string;
  fields: EntityFormField[];
  validationSchema?: z.ZodObject<any>;
  submitButtonText?: {
    create: string;
    update: string;
  };
}

export function EntityFormDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  initialValues,
  title,
  description,
  fields,
  validationSchema,
  submitButtonText = { create: "Create", update: "Update" },
}: EntityFormDialogProps<T>) {
  const defaultValues = fields.reduce(
    (acc, field) => {
      acc[field.name] = initialValues?.[field.name] ?? "";
      return acc;
    },
    {} as Record<string, any>
  );

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      if (validationSchema) {
        await formApi.validateAllFields("blur");
        await formApi.validateAllFields("change");

        const hasErrors = Object.values(formApi.state.fieldMeta).some(
          (meta) => meta?.errors && meta.errors.length > 0
        );

        if (hasErrors) {
          return;
        }
      }

      onSubmit(value as T);
      onOpenChange(false);
      form.reset();
    },
  });

  const renderField = (field: EntityFormField) => {
    if (field.type === "file") {
      return (
        <form.Field name={field.name} key={field.name}>
          {(fieldState) => (
            <UIField>
              <FieldLabel htmlFor={fieldState.name}>{field.label}</FieldLabel>
              <FileUploaderRegular
                pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                classNameUploader="uc-auto uc-purple"
                gridShowFileNames
                sourceList="local, gdrive"
                imgOnly
                multiple={false}
                filesViewMode="grid"
                onFileUploadSuccess={(e: { cdnUrl?: string } | null) => {
                  if (e?.cdnUrl) {
                    fieldState.handleChange(e.cdnUrl);
                  }
                }}
              />
            </UIField>
          )}
        </form.Field>
      );
    }

    if (field.type === "select" && field.selectOptions) {
      const options = field.selectOptions;
      return (
        <form.Field name={field.name} key={field.name}>
          {(fieldState) => (
            <UIField>
              <FieldLabel htmlFor={fieldState.name}>{field.label}</FieldLabel>
              <Select
                value={fieldState.state.value}
                onValueChange={fieldState.handleChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon ? (
                        <div className="flex items-center gap-2">
                          <option.icon className="size-4" />
                          <span>{option.label}</span>
                        </div>
                      ) : (
                        option.label
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </UIField>
          )}
        </form.Field>
      );
    }

    const handleChange = field.autoGenerateSlug
      ? (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (typeof value === "string") {
            form.setFieldValue(
              "slug",
              value.toLowerCase().replace(/\s+/g, "-")
            );
          }
        }
      : undefined;

    return (
      <Field
        form={form}
        name={field.name}
        label={field.label}
        placeholder={field.placeholder}
        description={field.description}
        required={field.required}
        as={field.type === "textarea" ? "textarea" : undefined}
        onBlur={
          validationSchema && field.name in validationSchema.shape
            ? field.required
              ? validateField(validationSchema.shape[field.name])
              : validateOptionalField(validationSchema.shape[field.name])
            : undefined
        }
        onChange={handleChange}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? `Edit ${title}` : `Add New ${title}`}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form form={form} className="space-y-4">
          <div className="grid gap-4">{fields.map(renderField)}</div>

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
                      ? `${submitButtonText.update}...`
                      : `${submitButtonText.create}...`
                    : initialValues
                      ? submitButtonText.update
                      : submitButtonText.create}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
