import { useForm } from '@tanstack/react-form';
import { ShippingAddressFields } from '@/components/containers/store/checkout/shipping-address-fields';
import {
  type ShippingAddressInput,
  shippingAddressSchema,
} from '@/lib/validators/shipping-address';

interface ShippingAddressFormProps {
  onSubmit?: (data: ShippingAddressInput) => void;
}

export default function ShippingAddressForm({
  onSubmit,
}: ShippingAddressFormProps) {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: 'BD',
      city: '',
      state: '',
      zipCode: '',
      description: '',
    } as ShippingAddressInput,
    validators: {
      onSubmit: shippingAddressSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit;
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">Shipping Address</h2>
        <ShippingAddressFields form={form as any} />
      </div>
    </form>
  );
}
