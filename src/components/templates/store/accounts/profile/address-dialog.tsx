import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

// Define the address schema
const addressSchema = z.object({
  type: z.enum(['Billing', 'Shipping']),
  title: z.string().min(1, 'Title is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP Code is required'),
  street: z.string().min(1, 'Street address is required'),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AddressFormValues | null;
  onSubmit: (data: AddressFormValues) => void;
}

export function AddressDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: AddressDialogProps) {
  const form = useForm({
    defaultValues: initialData || {
      type: 'Billing',
      title: '',
      country: '',
      city: '',
      state: '',
      zip: '',
      street: '',
    },
    validators: {
      onSubmit: addressSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as AddressFormValues);
      onOpenChange(false);
    },
  });

  // Reset form when initialData changes or dialog opens
  // Note: In a real app, you might want to handle this more robustly
  // For now, we rely on the parent to pass the correct initialData when opening

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="@2xl:max-w-150">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            {initialData ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {initialData
              ? 'Update your address details below.'
              : 'Enter the details for your new address.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6 py-2"
        >
          {/* Address Type Section */}
          <div className="space-y-4">
            <form.Field name="type">
              {(field) => (
                <Field>
                  <FieldLabel className="text-base">Address Type</FieldLabel>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as 'Billing' | 'Shipping')
                    }
                    className="flex gap-6 pt-2"
                  >
                    <div className="flex items-center space-x-2.5">
                      <RadioGroupItem value="Billing" id="billing" />
                      <Label
                        htmlFor="billing"
                        className="cursor-pointer font-medium"
                      >
                        Billing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <RadioGroupItem value="Shipping" id="shipping" />
                      <Label
                        htmlFor="shipping"
                        className="cursor-pointer font-medium"
                      >
                        Shipping
                      </Label>
                    </div>
                  </RadioGroup>
                </Field>
              )}
            </form.Field>
          </div>

          <div className="h-px bg-border" />

          {/* Address Details Section */}
          <div className="space-y-5">
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Address Label</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Home, Office, Parents House"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="street">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Street Address</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter your complete street address"
                      aria-invalid={isInvalid}
                      className="min-h-20 resize-none"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="city">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>City</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="City"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="state">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        State / Province
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="State"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="zip">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        ZIP / Postal Code
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="ZIP Code"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="country">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Country"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-25"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-35">
              {initialData ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
