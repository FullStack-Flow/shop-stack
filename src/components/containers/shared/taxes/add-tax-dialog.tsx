import {
  EntityFormDialog,
  type EntityFormField,
} from "@/components/base/forms/entity-form-dialog";
import { createTaxRateSchema } from "@/lib/validators/shared/tax-rate-query";
import type { TaxRateFormValues } from "@/types/taxes";

interface AddTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaxRateFormValues) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<TaxRateFormValues> | null;
}

export function AddTaxDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: AddTaxDialogProps) {
  const fields: EntityFormField[] = [
    {
      name: "name",
      label: "Name",
      required: true,
      placeholder: "Enter tax rate name",
      description: "Name for your tax rate (e.g., VAT, Sales Tax)",
    },
    {
      name: "rate",
      label: "Rate (%)",
      required: true,
      placeholder: "0.00",
      description: "Tax rate percentage (between 0.01 and 100)",
    },
    {
      name: "country",
      label: "Country",
      required: true,
      placeholder: "US, UK, CA",
      description: "ISO country code (2 characters)",
    },
    {
      name: "state",
      label: "State",
      placeholder: "NY, CA, TX",
      description: "State/Province code (optional)",
    },
    {
      name: "zip",
      label: "ZIP Code",
      placeholder: "12345",
      description: "ZIP/Postal code pattern (optional)",
    },
    {
      name: "priority",
      label: "Priority",
      required: true,
      placeholder: "1",
      description:
        "Priority for tax calculation (lower number = higher priority)",
    },
  ];

  return (
    <EntityFormDialog<TaxRateFormValues>
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      title="Tax Rate"
      description="Create or update a tax rate for your shop."
      validationSchema={createTaxRateSchema}
      submitButtonText={{
        create: "Create Tax Rate",
        update: "Update Tax Rate",
      }}
      fields={fields}
    />
  );
}
