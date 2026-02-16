import { useForm } from "@tanstack/react-form";
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateField, validateOptionalField } from "@/lib/helper/validators";
import { cn } from "@/lib/utils";

export interface EntityFormField {
  name: string;
  label?: string;
  type?: "text" | "textarea" | "url" | "file" | "select" | "custom";
  required?: boolean;
  multiple?: boolean;
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
  scrollable?: boolean;
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
  scrollable = true,
}: EntityFormDialogProps<T>) {
  const isEditing = Boolean(initialValues);
  const defaultValues = {
    ...fields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
      },
      {} as Record<string, any>,
    ),
    ...(initialValues || {}),
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      if (validationSchema) {
        await formApi.validateAllFields("blur");
        await formApi.validateAllFields("change");

        const errors = Object.entries(formApi.state.fieldMeta)
          .filter(([_key, meta]) => meta?.errors && meta.errors.length > 0)
          .map(([key, meta]) => ({
            field: key,
            errors: meta?.errors,
          }));

        if (errors.length > 0) {
          console.error("Form validation failed:", errors);
          toast.error("Please fix the errors in the form before submitting.");
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
        Object.entries(initialValues).forEach(([key, value]) => {
          form.setFieldValue(key as any, value);
        });
        // Also set defaults for fields not in initialValues
        fields.forEach((field) => {
          if (!(field.name in initialValues)) {
            form.setFieldValue(field.name as any, field.defaultValue ?? "");
          }
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
      const mode = field.autoGenerateSlug === "createOnly" ? !isEditing : true;
      if (mode) {
        validators.onChange = ({ value }: { value: string }) => {
          if (typeof value === "string") {
            form.setFieldValue(
              "slug",
              value.toLowerCase().replace(/\s+/g, "-"),
            );
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
                multiple={field.multiple}
                filesViewMode="grid"
                onFileUploadSuccess={(e: { cdnUrl?: string } | null) => {
                  if (e?.cdnUrl) {
                    if (field.multiple) {
                      const current = fieldState.state.value || [];
                      fieldState.handleChange([...current, e.cdnUrl]);
                    } else {
                      fieldState.handleChange(e.cdnUrl);
                    }
                  }
                }}
              />
              {!field.multiple && fieldState.state.value && (
                <div className="mt-2 relative group w-fit">
                  <img
                    src={fieldState.state.value}
                    alt="Preview"
                    className="size-16 rounded-md object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => fieldState.handleChange("")}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
              {field.multiple &&
                Array.isArray(fieldState.state.value) &&
                fieldState.state.value.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fieldState.state.value.map(
                      (url: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="size-16 rounded-md object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = fieldState.state.value.filter(
                                (_: any, i: number) => i !== index,
                              );
                              fieldState.handleChange(next);
                            }}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
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
                    value.toLowerCase().replace(/\s+/g, "-"),
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
      <DialogContent
        className={cn(
          contentClassName ?? "sm:max-w-125",
          scrollable && "h-[85vh] flex flex-col overflow-hidden min-h-0",
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {initialValues ? `Edit ${title}` : `Add New ${title}`}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          className={cn(
            "space-y-4",
            scrollable && "flex flex-col flex-1 overflow-hidden min-h-0",
          )}
        >
          <div
            className={cn(
              "flex flex-col flex-1 overflow-hidden",
              scrollable && "min-h-0",
            )}
          >
            {scrollable ? (
              <ScrollArea className="flex-1 min-h-0 h-full">
                <div className="grid gap-4 p-1 pr-4 pb-10">
                  {fields.map(renderField)}
                </div>
              </ScrollArea>
            ) : (
              <div className="grid gap-4">{fields.map(renderField)}</div>
            )}
          </div>

          <DialogFooter className="shrink-0">
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
