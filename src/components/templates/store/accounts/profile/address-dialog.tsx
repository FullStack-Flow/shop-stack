import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  type CreateAddressInput,
  createAddressSchema,
  type UpdateAddressInput,
  updateAddressSchema,
} from "@/lib/validators/address";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: UpdateAddressInput | null;
  onSubmit: (data: CreateAddressInput | UpdateAddressInput) => void;
  isSubmitting?: boolean;
}

export function AddressDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: AddressDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "title",
      label: "Address Title",
      placeholder: "e.g. Home, Office",
      required: true,
      type: "text",
    },
    {
      name: "firstName",
      label: "First Name",
      placeholder: "First Name",
      type: "text",
    },
    {
      name: "lastName",
      label: "Last Name",
      placeholder: "Last Name",
      type: "text",
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "+1 234 567 8900",
      type: "text",
    },
    {
      name: "street",
      label: "Street Address",
      placeholder: "123 Main St",
      required: true,
      type: "text",
    },
    {
      name: "city",
      label: "City",
      placeholder: "New York",
      required: true,
      type: "text",
    },
    {
      name: "state",
      label: "State / Province",
      placeholder: "NY",
      required: true,
      type: "text",
    },
    {
      name: "zip",
      label: "ZIP / Postal Code",
      placeholder: "10001",
      required: true,
      type: "text",
    },
    {
      name: "country",
      label: "Country",
      placeholder: "United States",
      required: true,
      type: "text",
    },
    {
      name: "type",
      label: "Address Type",
      type: "select",
      selectOptions: [
        { label: "Shipping", value: "shipping" },
        { label: "Billing", value: "billing" },
      ],
      required: true,
      defaultValue: "shipping",
    },
    {
      name: "isDefault",
      label: "Default Address",
      defaultValue: false,
      type: "custom",
      render: ({ form }) => (
        <form.Field
          name="isDefault"
          children={(field: any) => (
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="isDefault"
                checked={Boolean(field.state.value)}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
              />
              <Label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set as default address
              </Label>
            </div>
          )}
        />
      ),
    },
  ];

  return (
    <EntityFormDialog<CreateAddressInput | UpdateAddressInput>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialData}
      title="Address"
      description={
        initialData
          ? "Update your address details below."
          : "Enter the details for your new address."
      }
      validationSchema={initialData ? updateAddressSchema : createAddressSchema}
      submitButtonText={{
        create: "Add Address",
        update: "Update Address",
      }}
      fields={fields}
      contentClassName="sm:max-w-[600px]"
      scrollable
    />
  );
}
