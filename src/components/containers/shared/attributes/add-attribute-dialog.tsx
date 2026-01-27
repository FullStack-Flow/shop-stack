import { useForm } from "@tanstack/react-form";
import {
  Check,
  ImageIcon,
  Palette,
  Plus,
  Trash2,
  TypeIcon,
} from "lucide-react";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import getFieldErrors from "@/lib/helper/field-errors";
import { cn } from "@/lib/utils";
import type { AttributeFormValues, AttributeValue } from "@/types/attributes";

interface AddAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AttributeFormValues) => void;
  role?: "admin" | "vendor";
}

export function AddAttributeDialog({
  open,
  onOpenChange,
  onSubmit,
  role = "vendor",
}: AddAttributeDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      type: "select" as AttributeFormValues["type"],
      values: [] as AttributeValue[],
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      onOpenChange(false);
      form.reset();
    },
  });

  const typeOptions = [
    {
      value: "color",
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
      value: "image",
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
      value: "label",
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
      value: "select",
      label: "Select",
      icon: Check,
      preview: <div className="h-4 w-12 rounded border bg-white" />,
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] @xl:max-w-150 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Attribute</DialogTitle>
          <DialogDescription>
            {role === "admin"
              ? "Create a new attribute to define product variations across the platform."
              : "Create a new attribute to define product variations for your shop."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation;
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <div className="grid gap-4">
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          form.setFieldValue(
                            "slug",
                            e.target.value.toLowerCase().replace(/\s+/g, "-")
                          );
                        }}
                        placeholder="e.g. Color, Size, Material"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="slug">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. color, size, material"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={getFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="type">
                {(field) => (
                  <div className="space-y-3">
                    <FieldLabel>Type</FieldLabel>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {typeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-muted/50",
                            field.state.value === option.value
                              ? "border-primary bg-primary/5"
                              : "border-muted bg-transparent"
                          )}
                          onClick={() => field.handleChange(option.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              field.handleChange(option.value);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="mb-3 flex justify-between">
                            <span className="font-medium text-sm">
                              {option.label}
                            </span>
                            {field.state.value === option.value && (
                              <div className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex h-12 items-center justify-center rounded-md bg-muted/50">
                            {option.preview}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Determines how this attribute's values are displayed.
                    </p>
                  </div>
                )}
              </form.Field>

              <Separator />

              <form.Field name="values" mode="array">
                {(field) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">Values</h3>
                        <p className="text-muted-foreground text-xs">
                          Add values for this attribute.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.pushValue({
                            name: "",
                            slug: "",
                            value: "",
                            id: "",
                          })
                        }
                      >
                        <Plus className="mr-2 size-3" />
                        Add Value
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {field.state.value.map((_, i) => (
                        <div
                          key={i}
                          className="grid gap-3 rounded-lg border p-4 sm:grid-cols-12"
                        >
                          <div className="sm:col-span-4">
                            <form.Field name={`values[${i}].name`}>
                              {(subField) => (
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`value-name-${i}`}
                                    className="font-medium text-xs"
                                  >
                                    Name
                                  </label>
                                  <Input
                                    id={`value-name-${i}`}
                                    value={subField.state.value}
                                    onChange={(e) => {
                                      subField.handleChange(e.target.value);
                                      form.setFieldValue(
                                        `values[${i}].slug`,
                                        e.target.value
                                          .toLowerCase()
                                          .replace(/\s+/g, "-")
                                      );
                                    }}
                                    placeholder="Name"
                                    className="h-8"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>

                          <div className="sm:col-span-4">
                            <form.Field name={`values[${i}].slug`}>
                              {(subField) => (
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`value-slug-${i}`}
                                    className="font-medium text-xs"
                                  >
                                    Slug
                                  </label>
                                  <Input
                                    id={`value-slug-${i}`}
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Slug"
                                    className="h-8"
                                  />
                                </div>
                              )}
                            </form.Field>
                          </div>

                          <form.Subscribe
                            selector={(state) => state.values.type}
                            children={(type) => (
                              <>
                                {type === "color" && (
                                  <div className="sm:col-span-3">
                                    <form.Field name={`values[${i}].value`}>
                                      {(subField) => (
                                        <div className="space-y-1">
                                          <label
                                            htmlFor={`value-color-${i}`}
                                            className="font-medium text-xs"
                                          >
                                            Color
                                          </label>
                                          <div className="flex gap-2">
                                            <Input
                                              type="color"
                                              id={`value-color-picker-${i}`}
                                              value={
                                                subField.state.value ||
                                                "#000000"
                                              }
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value
                                                )
                                              }
                                              className="h-8 w-12 p-1"
                                              aria-label="Color Picker"
                                            />
                                            <Input
                                              id={`value-color-${i}`}
                                              value={subField.state.value}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value
                                                )
                                              }
                                              placeholder="#000000"
                                              className="h-8"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </form.Field>
                                  </div>
                                )}

                                {type === "image" && (
                                  <div className="sm:col-span-3">
                                    <form.Field name={`values[${i}].value`}>
                                      {(subField) => (
                                        <div className="space-y-1">
                                          <label
                                            htmlFor={`value-image-${i}`}
                                            className="font-medium text-xs"
                                          >
                                            Image URL
                                          </label>
                                          <Input
                                            id={`value-image-${i}`}
                                            value={subField.state.value}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value
                                              )
                                            }
                                            placeholder="https://..."
                                            className="h-8"
                                          />
                                        </div>
                                      )}
                                    </form.Field>
                                  </div>
                                )}
                              </>
                            )}
                          />

                          <div className="flex items-end justify-end sm:col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => field.removeValue(i)}
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
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Attribute</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
