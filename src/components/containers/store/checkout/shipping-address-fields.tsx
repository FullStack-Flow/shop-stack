import {
  FormTextareaField,
  FormTextField,
} from "@/components/base/forms/form-field";
import { PhoneInput } from "@/components/base/forms/phone-input";
import { FieldGroup } from "@/components/ui/field";
import type { ShippingAddressInput } from "@/lib/validators/shipping-address";

interface ShippingAddressFieldsProps {
  form: {
    Field: (props: {
      name: keyof ShippingAddressInput;
      children: (field: any) => React.ReactNode;
    }) => React.ReactNode;
  } & Record<string, unknown>;
}

export function ShippingAddressFields({ form }: ShippingAddressFieldsProps) {
  return (
    <FieldGroup className="gap-8">
      <div className="grid @4xl:grid-cols-2 grid-cols-1 gap-6">
        <form.Field
          name="firstName"
          children={(field) => (
            <FormTextField
              label="First Name"
              required
              placeholder="John"
              autoComplete="given-name"
              field={field}
            />
          )}
        />
        <form.Field
          name="lastName"
          children={(field) => (
            <FormTextField
              label="Last Name"
              required
              placeholder="Doe"
              autoComplete="family-name"
              field={field}
            />
          )}
        />
      </div>

      <div className="grid @4xl:grid-cols-2 grid-cols-1 gap-6">
        <form.Field
          name="email"
          children={(field) => (
            <FormTextField
              label="Email"
              required
              type="email"
              placeholder="john.doe@example.com"
              autoComplete="email"
              field={field}
            />
          )}
        />
        <form.Field name="phone">
          {(phoneField) => (
            <form.Field name="countryCode">
              {(countryCodeField) => (
                <PhoneInput
                  phoneValue={phoneField.state.value}
                  countryCodeValue={countryCodeField.state.value}
                  onPhoneChange={(value) => phoneField.handleChange(value)}
                  onCountryCodeChange={(value) =>
                    countryCodeField.handleChange(value)
                  }
                  error={
                    phoneField.state.meta.isTouched &&
                    !phoneField.state.meta.isValid
                      ? phoneField.state.meta.errors[0]
                      : undefined
                  }
                />
              )}
            </form.Field>
          )}
        </form.Field>
      </div>

      <form.Field
        name="street"
        children={(field) => (
          <FormTextField
            label="Street Address"
            required
            placeholder="123 Main St"
            autoComplete="street-address"
            field={field}
          />
        )}
      />

      <div className="grid @4xl:grid-cols-3 grid-cols-1 gap-6">
        <form.Field
          name="city"
          children={(field) => (
            <FormTextField
              label="City"
              required
              placeholder="Dhaka"
              autoComplete="address-level2"
              field={field}
            />
          )}
        />
        <form.Field
          name="state"
          children={(field) => (
            <FormTextField
              label="State"
              required
              placeholder="Dhaka Division"
              autoComplete="address-level1"
              field={field}
            />
          )}
        />
        <form.Field
          name="zipCode"
          children={(field) => (
            <FormTextField
              label="Zip Code"
              required
              placeholder="1200"
              autoComplete="postal-code"
              field={field}
            />
          )}
        />
      </div>

      <form.Field
        name="description"
        children={(field) => (
          <FormTextareaField
            label="Description"
            placeholder="Add any special delivery instructions..."
            description="Optional: Add any special delivery instructions or notes."
            field={field}
            className="min-h-24"
          />
        )}
      />
    </FieldGroup>
  );
}
