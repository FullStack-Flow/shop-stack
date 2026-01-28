import {
  Check,
  Image as ImageIcon,
  Palette,
  Plus,
  Trash2,
  Type as TypeIcon,
} from "lucide-react";
import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import getFieldErrors from "@/lib/helper/field-errors";
import { validateField } from "@/lib/helper/validators";
import { cn } from "@/lib/utils";
import {
  attributeValueInputSchema,
  createAttributeSchema,
} from "@/lib/validators/shared/attribute-query";
import type { AttributeFormValues, AttributeValue } from "@/types/attributes";

interface AddAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttributeFormValues) => void | Promise<void>;
  role?: "admin" | "vendor";
  isSubmitting?: boolean;
  initialValues?: AttributeFormValues | null;
}

// Use the shared schema but omit shopId as it's injected by the mutation context
const formSchema = createAttributeSchema.omit({ shopId: true });

const TYPE_OPTIONS = [
  {
    value: "color" as const,
    label: "Color",
    icon: Palette,
    preview: (
      <div className="flex gap-1">
        <div className="size-4 rounded-full border bg-white" />
        <div className="size-4 rounded-full border bg-yellow-200" />
        <div className="size-4 rounded-full border bg-blue-200" />
      </div>
    ),
  },
  {
    value: "image" as const,
    label: "Image",
    icon: ImageIcon,
    preview: (
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="size-4 rounded bg-muted" />
        ))}
      </div>
    ),
  },
  {
    value: "label" as const,
    label: "Label",
    icon: TypeIcon,
    preview: (
      <div className="flex gap-1">
        <div className="flex h-4 w-4 items-center justify-center rounded border bg-white text-[8px]">
          XL
        </div>
        <div className="flex h-4 w-4 items-center justify-center rounded border bg-white text-[8px]">
          L
        </div>
      </div>
    ),
  },
  {
    value: "select" as const,
    label: "Select",
    icon: Check,
    preview: <div className="h-4 w-12 rounded border bg-white" />,
  },
];

function generateSlugFromName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function createTempId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AddAttributeDialog({
  open,
  onOpenChange,
  onSubmit,
  role = "vendor",
  isSubmitting = false,
  initialValues,
}: AddAttributeDialogProps) {
  const handleValueNameChange = (
    form: any,
    index: number,
    nextName: string,
    fieldHandler: (val: string) => void,
  ) => {
    fieldHandler(nextName);
    form.setFieldValue(`values[${index}].slug`, generateSlugFromName(nextName));
  };

  const normalizedInitialValues = initialValues
    ? {
        ...initialValues,
        values: initialValues.values.map((v) => ({
          id: v.id || createTempId(),
          name: v.name,
          slug: v.slug,
          value: v.value,
        })),
      }
    : null;

  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Attribute Name",
      required: true,
      placeholder: "e.g. Color, Size, Material",
      autoGenerateSlug: "createOnly",
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
      type: "custom",
      required: true,
      defaultValue: "select",
      render: ({ form }) => (
        <form.Field name="type">
          {(field: any) => (
            <div className="space-y-3">
              <FieldLabel>Type</FieldLabel>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {TYPE_OPTIONS.map((option) => {
                  const isSelected = field.state.value === option.value;
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected &&
                          "border-primary bg-accent text-accent-foreground ring-1 ring-primary",
                      )}
                      onClick={() => field.handleChange(option.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          field.handleChange(option.value);
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {option.preview}
                      </div>
                    </div>
                  );
                })}
              </div>
              <FieldDescription>
                Determines how this attribute's values are displayed.
              </FieldDescription>
            </div>
          )}
        </form.Field>
      ),
    },
    {
      name: "values",
      type: "custom",
      defaultValue: [],
      render: ({ form, isSubmitting: isSubmittingExternal }) => (
        <div className="space-y-4">
          <Separator />

          <form.Field name="values" mode="array">
            {(field: any) => (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Values</div>
                    <div className="text-muted-foreground text-xs">
                      Add values for this attribute.
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      field.pushValue({
                        id: createTempId(),
                        name: "",
                        slug: "",
                        value: "",
                      } satisfies AttributeValue)
                    }
                    disabled={isSubmittingExternal}
                  >
                    <Plus className="mr-2 size-3" />
                    Add Value
                  </Button>
                </div>

                <div className="space-y-3">
                  {field.state.value.map((value: any, i: number) => (
                    <div
                      key={value?.id || i}
                      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-12"
                    >
                      <div className="sm:col-span-4">
                        <form.Field
                          name={`values[${i}].name`}
                          validators={{
                            onBlur: validateField(
                              attributeValueInputSchema.shape.name,
                            ),
                          }}
                        >
                          {(subField: any) => {
                            const isInvalid =
                              subField.state.meta.isTouched &&
                              !subField.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid} className="gap-1">
                                <FieldLabel
                                  htmlFor={`value-name-${i}`}
                                  className="text-xs"
                                >
                                  Name
                                </FieldLabel>
                                <Input
                                  id={`value-name-${i}`}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    handleValueNameChange(
                                      form,
                                      i,
                                      e.target.value,
                                      subField.handleChange,
                                    )
                                  }
                                  placeholder="Name"
                                  className="h-8"
                                  aria-invalid={isInvalid}
                                  disabled={isSubmittingExternal}
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={getFieldErrors(
                                      subField.state.meta.errors,
                                    )}
                                  />
                                )}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      <div className="sm:col-span-4">
                        <form.Field
                          name={`values[${i}].slug`}
                          validators={{
                            onBlur: validateField(
                              attributeValueInputSchema.shape.slug,
                            ),
                          }}
                        >
                          {(subField: any) => {
                            const isInvalid =
                              subField.state.meta.isTouched &&
                              !subField.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid} className="gap-1">
                                <FieldLabel
                                  htmlFor={`value-slug-${i}`}
                                  className="text-xs"
                                >
                                  Slug
                                </FieldLabel>
                                <Input
                                  id={`value-slug-${i}`}
                                  value={subField.state.value}
                                  onBlur={subField.handleBlur}
                                  onChange={(e) =>
                                    subField.handleChange(e.target.value)
                                  }
                                  placeholder="Slug"
                                  className="h-8"
                                  aria-invalid={isInvalid}
                                  disabled={isSubmittingExternal}
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={getFieldErrors(
                                      subField.state.meta.errors,
                                    )}
                                  />
                                )}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      <form.Subscribe
                        selector={(state: any) => state.values.type}
                      >
                        {(type: any) => (
                          <>
                            {type === "color" && (
                              <div className="sm:col-span-3">
                                <form.Field
                                  name={`values[${i}].value`}
                                  validators={{
                                    onBlur: validateField(
                                      attributeValueInputSchema.shape.value,
                                    ),
                                  }}
                                >
                                  {(subField: any) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        data-invalid={isInvalid}
                                        className="gap-1"
                                      >
                                        <FieldLabel
                                          htmlFor={`value-color-${i}`}
                                          className="text-xs"
                                        >
                                          Color
                                        </FieldLabel>
                                        <div className="flex gap-2">
                                          <Input
                                            type="color"
                                            id={`value-color-picker-${i}`}
                                            value={
                                              subField.state.value || "#000000"
                                            }
                                            onBlur={subField.handleBlur}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value,
                                              )
                                            }
                                            className="h-8 w-12 p-1"
                                            aria-label="Color Picker"
                                            disabled={isSubmittingExternal}
                                          />
                                          <Input
                                            id={`value-color-${i}`}
                                            value={subField.state.value}
                                            onBlur={subField.handleBlur}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value,
                                              )
                                            }
                                            placeholder="#000000"
                                            className="h-8"
                                            aria-invalid={isInvalid}
                                            disabled={isSubmittingExternal}
                                          />
                                        </div>
                                        {isInvalid && (
                                          <FieldError
                                            errors={getFieldErrors(
                                              subField.state.meta.errors,
                                            )}
                                          />
                                        )}
                                      </Field>
                                    );
                                  }}
                                </form.Field>
                              </div>
                            )}

                            {type === "image" && (
                              <div className="sm:col-span-3">
                                <form.Field
                                  name={`values[${i}].value`}
                                  validators={{
                                    onBlur: validateField(
                                      attributeValueInputSchema.shape.value,
                                    ),
                                  }}
                                >
                                  {(subField: any) => {
                                    const isInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        data-invalid={isInvalid}
                                        className="gap-1"
                                      >
                                        <FieldLabel
                                          htmlFor={`value-image-${i}`}
                                          className="text-xs"
                                        >
                                          Image URL
                                        </FieldLabel>
                                        <Input
                                          id={`value-image-${i}`}
                                          value={subField.state.value}
                                          onBlur={subField.handleBlur}
                                          onChange={(e) =>
                                            subField.handleChange(
                                              e.target.value,
                                            )
                                          }
                                          placeholder="https://..."
                                          className="h-8"
                                          aria-invalid={isInvalid}
                                          disabled={isSubmittingExternal}
                                        />
                                        {isInvalid && (
                                          <FieldError
                                            errors={getFieldErrors(
                                              subField.state.meta.errors,
                                            )}
                                          />
                                        )}
                                      </Field>
                                    );
                                  }}
                                </form.Field>
                              </div>
                            )}
                          </>
                        )}
                      </form.Subscribe>

                      <div className="flex items-end justify-end sm:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => field.removeValue(i)}
                          disabled={isSubmittingExternal}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {field.state.value.length === 0 && (
                    <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
                      <p>No values added yet.</p>
                      <p className="text-xs">
                        Click "Add Value" to start adding options.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form.Field>
        </div>
      ),
    },
  ];

  const descriptionText =
    role === "admin"
      ? "Create a new attribute for the platform."
      : "Create a new attribute to define product variations.";

  return (
    <EntityFormDialog<AttributeFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={normalizedInitialValues}
      title="Attribute"
      description={descriptionText}
      validationSchema={formSchema}
      submitButtonText={{
        create: "Create Attribute",
        update: "Update Attribute",
      }}
      fields={fields}
      contentClassName="max-h-[90vh] overflow-y-auto sm:max-w-150"
    />
  );
}
