import { useMemo } from "react";
import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { CreateShippingMethodInput } from "@/lib/validators/shipping";
import { createShippingMethodSchema } from "@/lib/validators/shipping";

type ShippingFormValues = Omit<CreateShippingMethodInput, "shopId">;

interface AddShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShippingFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: ShippingFormValues | null;
}

export function AddShippingDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  initialValues,
}: AddShippingDialogProps) {
  const fields: EntityFormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Name",
        required: true,
        placeholder: "e.g. Standard Shipping",
        defaultValue: "",
      },
      {
        name: "price",
        label: "Price",
        required: true,
        placeholder: "0.00",
        defaultValue: 0,
      },
      {
        name: "duration",
        label: "Duration",
        required: true,
        placeholder: "e.g. 3-5 business days",
        defaultValue: "",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe this shipping method...",
        defaultValue: "",
      },
      {
        name: "isActive",
        label: "Active Status",
        type: "custom",
        defaultValue: true,
        render: ({
          form,
          isSubmitting: isSubmittingExternal,
        }: {
          form: any;
          isSubmitting: boolean;
        }) => (
          <form.Field name="isActive">
            {(field: any) => (
              <div className="flex items-center gap-2 mt-4">
                <Switch
                  id="isActive"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  disabled={isSubmittingExternal}
                />
                <FieldLabel htmlFor="isActive" className="m-0">
                  Active
                </FieldLabel>
              </div>
            )}
          </form.Field>
        ),
      },
    ],
    [],
  );

  return (
    <EntityFormDialog<ShippingFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={(data) => {
        onSubmit({
          ...data,
          price: Number(data.price),
        });
      }}
      isSubmitting={isSubmitting}
      title="Shipping Method"
      description="Add a new shipping method for your shop."
      validationSchema={createShippingMethodSchema}
      submitButtonText={{
        create: "Create Method",
        update: "Update Method",
      }}
      fields={fields}
      initialValues={initialValues}
    />
  );
}
