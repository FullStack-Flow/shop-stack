import { useForm } from "@tanstack/react-form";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import { useEffect, useRef } from "react";
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
import {
  FieldDescription,
  FieldLabel,
  Field as UIField,
} from "@/components/ui/field";
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
  label?: string;
  type?: "text" | "textarea" | "url" | "file" | "select" | "custom";
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  autoGenerateSlug?: boolean | "createOnly";
  selectOptions?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  render?: (props: {
    form: any;
    isSubmitting: boolean;
    isEditing: boolean;
  }) => React.ReactNode;
}

interface EntityFormDialogProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: T) => void | Promise<void>;
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
  contentClassName?: string;
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
  contentClassName,
}: EntityFormDialogProps<T>) {
  const isEditing = Boolean(initialValues);
  const defaultValues = fields.reduce(
    (acc, field) => {
      acc[field.name] =
        initialValues?.[field.name] ?? field.defaultValue ?? "";
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

      await onSubmit(value as T);
      onOpenChange(false);
      form.reset();
    },
  });

  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      if (initialValues) {
        fields.forEach((field) => {
          form.setFieldValue(
            field.name,
            initialValues[field.name] ?? field.defaultValue ?? ""
          );
        });
      } else {
        form.reset();
        fields.forEach((field) => {
          const value = field.defaultValue ?? "";
          if (value !== "") {
            form.setFieldValue(field.name, value);
          }
        });
      }
    }

    if (!open && prevOpenRef.current) {
      form.reset();
    }

    prevOpenRef.current = open;
  }, [open, initialValues, fields, form]);

  const renderField = (field: EntityFormField) => {
    if (field.type === "custom" && field.render) {
      return (
        <div key={field.name}>
          {field.render({
            form,
            isSubmitting: externalIsSubmitting,
            isEditing,
          })}
        </div>
      );
    }

    const fieldSchema = validationSchema?.shape[field.name];

    const validators: Record<string, (props: any) => unknown> = {};
    if (fieldSchema) {
      validators.onBlur = field.required
        ? validateField(fieldSchema)
        : validateOptionalField(fieldSchema);
    }

    if (field.autoGenerateSlug) {
      const mode =
        field.autoGenerateSlug === "createOnly" ? !isEditing : true;
      if (mode) {
        validators.onChange = ({ value }: { value: string }) => {
          if (typeof value === "string") {
            form.setFieldValue("slug", value.toLowerCase().replace(/\s+/g, "-"));
          }
        };
      }
    }

    if (field.type === "file") {
      return (
        <form.Field
          name={field.name}
          key={field.name}
          {...(Object.keys(validators).length > 0 ? { validators } : {})}
        >
          {(fieldState) => (
            <UIField>
              <FieldLabel htmlFor={fieldState.name} required={field.required}>
                {field.label}
              </FieldLabel>
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
              {field.description && (
                <FieldDescription>{field.description}</FieldDescription>
              )}
            </UIField>
          )}
        </form.Field>
      );
    }

    if (field.type === "select" && field.selectOptions) {
      const options = field.selectOptions;
      return (
        <form.Field
          name={field.name}
          key={field.name}
          {...(Object.keys(validators).length > 0 ? { validators } : {})}
        >
          {(fieldState) => (
            <UIField>
              <FieldLabel htmlFor={fieldState.name} required={field.required}>
                {field.label}
              </FieldLabel>
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
              {field.description && (
                <FieldDescription>{field.description}</FieldDescription>
              )}
            </UIField>
          )}
        </form.Field>
      );
    }

    return (
      <Field
        key={field.name}
        form={form}
        name={field.name}
        label={field.label ?? field.name}
        placeholder={field.placeholder}
        description={field.description}
        required={field.required}
        as={field.type === "textarea" ? "textarea" : undefined}
        onBlur={
          fieldSchema
            ? field.required
              ? validateField(fieldSchema)
              : validateOptionalField(fieldSchema)
            : undefined
        }
        onChange={
          field.autoGenerateSlug
            ? ({ value }: { value: string }) => {
                const shouldAuto =
                  field.autoGenerateSlug === "createOnly" ? !isEditing : true;

                if (shouldAuto && typeof value === "string") {
                  form.setFieldValue(
                    "slug",
                    value.toLowerCase().replace(/\s+/g, "-")
                  );
                }
              }
            : undefined
        }
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName ?? "sm:max-w-125"}>
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
