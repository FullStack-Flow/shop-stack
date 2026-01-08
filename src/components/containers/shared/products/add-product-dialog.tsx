import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export interface ProductFormValues {
  name: string;
  sku: string;
  price: string;
  stock: string;
  description?: string;
  categoryId: string;
  brandId: string;
  tagIds: string[];
  attributes: { name: string; value: string }[];
  taxId: string;
  shippingMethodIds: string[];
}

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormValues) => void;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  availableAttributes?: { id: string; name: string }[];
  taxes?: { id: string; name: string; rate: number }[];
  shippingMethods?: { id: string; name: string; price: number }[];
}

function getFieldErrors(errors: any): string[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter((error): error is string => typeof error === "string");
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSubmit,
  categories,
  brands,
  tags,
  availableAttributes = [],
  taxes = [],
  shippingMethods = [],
}: AddProductDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      stock: "",
      description: "",
      categoryId: "",
      brandId: "",
      tagIds: [],
      attributes: [],
      taxId: "",
      shippingMethodIds: [],
    } as ProductFormValues,
    onSubmit: async ({ value, formApi }) => {
      onSubmit(value);
      onOpenChange(false);
      formApi.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for your new product.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
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
                      <FieldLabel htmlFor={field.name}>
                        Product Name*
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter product name"
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

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="sku">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>SKU*</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter SKU"
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

                <form.Field name="stock">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Stock*</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="0"
                          type="number"
                          min="0"
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
              </div>

              <form.Field name="price">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Price*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
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

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="categoryId">
                  {(field) => (
                    <Field>
                      <FieldLabel>Category</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="brandId">
                  {(field) => (
                    <Field>
                      <FieldLabel>Brand</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <form.Field name="taxId">
                  {(field) => (
                    <Field>
                      <FieldLabel>Tax Rate</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax rate" />
                        </SelectTrigger>
                        <SelectContent>
                          {taxes.map((tax) => (
                            <SelectItem key={tax.id} value={tax.id}>
                              {tax.name} ({tax.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="shippingMethodIds">
                  {(field) => (
                    <Field>
                      <FieldLabel>Shipping Methods</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.state.value.length &&
                                "text-muted-foreground"
                            )}
                          >
                            {field.state.value.length > 0
                              ? `${field.state.value.length} methods selected`
                              : "Select shipping methods"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search shipping methods..." />
                            <CommandList>
                              <CommandEmpty>No method found.</CommandEmpty>
                              <CommandGroup>
                                {shippingMethods.map((method) => (
                                  <CommandItem
                                    key={method.id}
                                    value={method.name}
                                    onSelect={() => {
                                      const current = field.state.value;
                                      const next = current.includes(method.id)
                                        ? current.filter(
                                            (id) => id !== method.id
                                          )
                                        : [...current, method.id];
                                      field.handleChange(next);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.state.value.includes(method.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {method.name} (${method.price})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {field.state.value.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {field.state.value.map((methodId) => {
                            const method = shippingMethods.find(
                              (m) => m.id === methodId
                            );
                            return (
                              <Badge
                                key={methodId}
                                variant="secondary"
                                className="mr-1"
                              >
                                {method?.name}
                                <button
                                  type="button"
                                  className="ml-1 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    field.handleChange(
                                      field.state.value.filter(
                                        (id) => id !== methodId
                                      )
                                    );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </Field>
                  )}
                </form.Field>
              </div>

              <form.Field name="tagIds">
                {(field) => (
                  <Field>
                    <FieldLabel>Tags</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.state.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.state.value.length > 0
                            ? `${field.state.value.length} tags selected`
                            : "Select tags"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandList>
                            <CommandEmpty>No tag found.</CommandEmpty>
                            <CommandGroup>
                              {tags.map((tag) => (
                                <CommandItem
                                  key={tag.id}
                                  value={tag.name}
                                  onSelect={() => {
                                    const current = field.state.value;
                                    const next = current.includes(tag.id)
                                      ? current.filter((id) => id !== tag.id)
                                      : [...current, tag.id];
                                    field.handleChange(next);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.state.value.includes(tag.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {tag.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.state.value.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {field.state.value.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          return (
                            <Badge
                              key={tagId}
                              variant="secondary"
                              className="mr-1"
                            >
                              {tag?.name}
                              <button
                                type="button"
                                className="ml-1 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => {
                                  field.handleChange(
                                    field.state.value.filter(
                                      (id) => id !== tagId
                                    )
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Product description..."
                    />
                  </Field>
                )}
              </form.Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <FieldLabel>Attributes</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.pushFieldValue("attributes", { name: "", value: "" })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Attribute
                  </Button>
                </div>

                {availableAttributes.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-muted-foreground text-xs">
                      Suggested Attributes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableAttributes.map((attr) => (
                        <Badge
                          key={attr.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() =>
                            form.pushFieldValue("attributes", {
                              name: attr.name,
                              value: "",
                            })
                          }
                        >
                          <Plus className="mr-1 size-3" />
                          {attr.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <form.Field name="attributes" mode="array">
                  {(field) => {
                    return (
                      <div className="space-y-2">
                        {field.state.value.map((_, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <form.Field name={`attributes[${i}].name`}>
                              {(subField) => (
                                <div className="flex-1">
                                  <Input
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Name (e.g. Color)"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <form.Field name={`attributes[${i}].value`}>
                              {(subField) => (
                                <div className="flex-1">
                                  <Input
                                    value={subField.state.value}
                                    onChange={(e) =>
                                      subField.handleChange(e.target.value)
                                    }
                                    placeholder="Value (e.g. Red)"
                                  />
                                </div>
                              )}
                            </form.Field>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                form.removeFieldValue("attributes", i)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </form.Field>
              </div>
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
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Add Product"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
