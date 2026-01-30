import { format, parseISO } from "date-fns";
import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { couponFormSchema } from "@/lib/validators/coupon";
import type { CouponFormValues, CouponItem } from "@/types/coupons";

interface AddCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CouponFormValues) => void;
  role?: "admin" | "vendor";
  isSubmitting?: boolean;
  initialValues?: CouponItem | null;
}

export function AddCouponDialog({
  open,
  onOpenChange,
  onSubmit,
  role = "vendor",
  isSubmitting = false,
  initialValues,
}: AddCouponDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "code",
      label: "Coupon Code",
      required: true,
      placeholder: "SUMMER2024",
      description: "Unique code for the coupon (uppercase).",
      type: "text",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Summer sale discount...",
    },
    {
      name: "image",
      label: "Image URL",
      type: "file",
      placeholder: "https://example.com/image.png",
      description: "Optional image for the coupon.",
    },
    {
      name: "type",
      label: "Discount Type",
      type: "select",
      required: true,
      defaultValue: "percentage",
      placeholder: "Select type",
      selectOptions: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed Amount", value: "fixed" },
        { label: "Free Shipping", value: "free_shipping" },
      ],
    },
    {
      name: "discountAmount",
      type: "custom",
      render: ({ form }) => (
        <form.Subscribe
          selector={(state: any) => state.values.type}
          children={(type: any) => {
            const isFreeShipping = type === "free_shipping";
            const isPercentage = type === "percentage";
            return (
              <form.Field name="discountAmount">
                {(field: any) => (
                  <Field className={isFreeShipping ? "opacity-50" : ""}>
                    <FieldLabel htmlFor={field.name} required={!isFreeShipping}>
                      {isPercentage ? "Discount (%)" : "Discount Amount ($)"}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isFreeShipping}
                      placeholder={isPercentage ? "10" : "10.00"}
                    />
                  </Field>
                )}
              </form.Field>
            );
          }}
        />
      ),
    },
    {
      name: "minimumCartAmount",
      label: "Min. Cart Amount",
      type: "text",
    },
    {
      name: "maximumDiscountAmount",
      type: "custom",
      render: ({ form }) => (
        <form.Subscribe
          selector={(state: any) => state.values.type}
          children={(type: any) => {
            if (type !== "percentage") return null;
            return (
              <form.Field name="maximumDiscountAmount">
                {(field: any) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Max. Discount ($)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Optional limit"
                    />
                  </Field>
                )}
              </form.Field>
            );
          }}
        />
      ),
    },
    {
      name: "activeFrom",
      type: "custom",
      defaultValue: new Date().toISOString().split("T")[0],
      render: ({ form }) => (
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="activeFrom">
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name} required>
                  Active From
                </FieldLabel>
                <DatePicker
                  date={
                    field.state.value ? parseISO(field.state.value) : undefined
                  }
                  setDate={(date) =>
                    field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  placeholder="Pick a start date"
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="activeTo">
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor={field.name} required>
                  Active To
                </FieldLabel>
                <DatePicker
                  date={
                    field.state.value ? parseISO(field.state.value) : undefined
                  }
                  setDate={(date) =>
                    field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  placeholder="Pick an end date"
                />
              </Field>
            )}
          </form.Field>
        </div>
      ),
    },
    {
      name: "activeTo",
      type: "custom",
      defaultValue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      render: () => null,
    },
    {
      name: "usageLimit",
      label: "Usage Limit",
      type: "text",
      placeholder: "Unlimited",
    },
    {
      name: "usageLimitPerUser",
      label: "Usage Limit Per User",
      type: "text",
      defaultValue: 1,
      placeholder: "1",
    },
    {
      name: "isActive",
      type: "custom",
      defaultValue: true,
      render: ({ form }) => (
        <form.Field name="isActive">
          {(field: any) => (
            <div className="flex items-center gap-2">
              <Switch
                id={field.name}
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <FieldLabel htmlFor={field.name} className="mb-0">
                Active
              </FieldLabel>
            </div>
          )}
        </form.Field>
      ),
    },
    {
      name: "applicableTo",
      label: "Applicable To",
      type: "select",
      defaultValue: "all",
      placeholder: "Select applicability",
      selectOptions: [
        { label: "All Products", value: "all" },
        { label: "Specific Products", value: "specific_products" },
        { label: "Specific Categories", value: "specific_categories" },
      ],
    },
    {
      name: "productIds",
      type: "custom",
      defaultValue: [],
      render: ({ form }) => (
        <form.Subscribe
          selector={(state: any) => state.values.applicableTo}
          children={(applicableTo: any) => {
            if (applicableTo !== "specific_products") return null;
            return (
              <form.Field name="productIds">
                {(field: any) => (
                  <Field>
                    <FieldLabel htmlFor={field.name} required>
                      Product IDs
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join(", ")
                          : field.state.value
                      }
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="prod_123, prod_456"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of product IDs.
                    </p>
                  </Field>
                )}
              </form.Field>
            );
          }}
        />
      ),
    },
    {
      name: "categoryIds",
      type: "custom",
      defaultValue: [],
      render: ({ form }) => (
        <form.Subscribe
          selector={(state: any) => state.values.applicableTo}
          children={(applicableTo: any) => {
            if (applicableTo !== "specific_categories") return null;
            return (
              <form.Field name="categoryIds">
                {(field: any) => (
                  <Field>
                    <FieldLabel htmlFor={field.name} required>
                      Category IDs
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join(", ")
                          : field.state.value
                      }
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value
                            .split(",")
                            .map((s: string) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="cat_123, cat_456"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of category IDs.
                    </p>
                  </Field>
                )}
              </form.Field>
            );
          }}
        />
      ),
    },
  ];

  // Helper to format initial values
  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        discountAmount: initialValues.discountAmount?.toString() ?? "0",
        minimumCartAmount: initialValues.minimumCartAmount?.toString() ?? "0",
        maximumDiscountAmount:
          initialValues.maximumDiscountAmount?.toString() ?? undefined,
        activeFrom: initialValues.activeFrom
          ? new Date(initialValues.activeFrom).toISOString().split("T")[0]
          : "",
        activeTo: initialValues.activeTo
          ? new Date(initialValues.activeTo).toISOString().split("T")[0]
          : "",
      }
    : undefined;

  return (
    <EntityFormDialog<CouponFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={formattedInitialValues as any}
      title={role === "admin" ? "Platform Coupon" : "Shop Coupon"}
      description={
        role === "admin"
          ? "Create a new discount coupon for the platform."
          : "Create a new discount coupon for your shop."
      }
      validationSchema={couponFormSchema}
      submitButtonText={{
        create: "Create Coupon",
        update: "Update Coupon",
      }}
      fields={fields}
      contentClassName="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
    />
  );
}
