import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import getFieldErrors from '@/lib/helper/field-errors';
import type { CouponFormValues } from '@/types/coupon';

interface AddCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CouponFormValues) => void;
  role?: 'admin' | 'vendor';
}

export function AddCouponDialog({
  open,
  onOpenChange,
  onSubmit,
  role = 'vendor',
}: AddCouponDialogProps) {
  const form = useForm({
    defaultValues: {
      code: '',
      description: '',
      type: 'fixed' as 'percentage' | 'fixed' | 'free_shipping',
      discountAmount: 0,
      minimumCartAmount: 0,
      activeFrom: '',
      activeTo: '',
      status: 'active' as 'active' | 'expired' | 'inactive',
      usageLimit: undefined as number | undefined,
      image: null as FileList | null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Coupon</DialogTitle>
          <DialogDescription>
            {role === 'admin'
              ? 'Create a new discount coupon for the platform.'
              : 'Create a new discount coupon for your shop.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <FieldGroup>
              <form.Field name="code">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Coupon Code</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toUpperCase())
                        }
                        placeholder="SUMMER2024"
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

              <form.Field name="description">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Summer sale discount"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="type">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Discount Type</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value as any)
                      }
                      placeholder="fixed"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="discountAmount">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Discount Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      placeholder="10"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="minimumCartAmount">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Minimum Cart Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      placeholder="50"
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="activeFrom">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Active From</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="activeTo">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Active To</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="usageLimit">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Usage Limit (Optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="100"
                    />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Coupon</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
