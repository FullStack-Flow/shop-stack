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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserFormValues } from '@/types/users';

function getFieldErrors(errors: any): string[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter((error): error is string => typeof error === 'string');
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddUserDialogProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      status: 'active' as 'active' | 'inactive' | 'suspended',
      avatar: null as FileList | null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
      onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Add a new user to the platform.</DialogDescription>
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
                      <FieldLabel htmlFor={field.name}>Name*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. John Doe"
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

              <form.Field name="email">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. john@example.com"
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

              <form.Field name="status">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as 'active' | 'inactive' | 'suspended'
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="avatar">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Avatar (Optional)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept="image/*"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.files)}
                        aria-invalid={isInvalid}
                        className="cursor-pointer"
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
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
