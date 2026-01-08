import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export interface ShopFormValues {
  name: string;
  slug: string;
  description: string;
  logo: FileList | null;
  banner: FileList | null;
  address: string;
  phone: string;
  email: string;
  enableNotification: boolean;
}

interface AddShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShopFormValues) => void;
}

function getFieldErrors(errors: any): string[] {
  if (!Array.isArray(errors)) return [];
  return errors.filter((error): error is string => typeof error === "string");
}

export function AddShopDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddShopDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logo: null as FileList | null,
      banner: null as FileList | null,
      address: "",
      phone: "",
      email: "",
      enableNotification: false,
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
          <DialogTitle>Create New Shop</DialogTitle>
          <DialogDescription>
            Enter the details for your new shop.
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
                      <FieldLabel htmlFor={field.name}>Shop Name*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          form.setFieldValue(
                            "slug",
                            e.target.value.toLowerCase().replace(/\s+/g, "-")
                          );
                        }}
                        placeholder="e.g. Tech Gadgets Store"
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

              <form.Field name="slug">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Slug*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. tech-gadgets-store"
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
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Describe your shop..."
                        aria-invalid={isInvalid}
                        className="resize-none"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="logo">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Logo</FieldLabel>
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

                <form.Field name="banner">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Banner</FieldLabel>
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

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Address*</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. 123 Tech St, Silicon Valley"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="phone">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Phone*</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. +1 234 567 8900"
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
                        <FieldLabel htmlFor={field.name}>
                          Notification Email (Coming Soon)
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter email for notifications"
                          aria-invalid={isInvalid}
                          disabled
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

              <form.Field name="enableNotification">
                {(field) => {
                  return (
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <Label htmlFor={field.name} className="text-base">
                          Enable Notifications
                        </Label>
                        <p className="text-muted-foreground text-sm">
                          Receive updates about your shop.
                        </p>
                      </div>
                      <Switch
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked)
                        }
                      />
                    </div>
                  );
                }}
              </form.Field>

              <Separator />

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 font-semibold">Payment Information</h4>
                <p className="text-muted-foreground text-sm">
                  Stripe connection will be available soon to handle your
                  payments securely.
                </p>
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
                  {isSubmitting ? "Creating..." : "Create Shop"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
