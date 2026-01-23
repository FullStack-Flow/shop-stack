import { useForm } from "@tanstack/react-form";
import { FileUploaderMinimal } from "@uploadcare/react-uploader";
import { X } from "lucide-react";
import { Form } from "@/components/base/forms/form";
import { Field } from "@/components/base/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel, Field as UIField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { validateField, validateOptionalField } from "@/lib/helper/validators";
import { shopSchema } from "@/lib/validators/shop";
import type { ShopFormValues } from "@/types/shop";
import "@uploadcare/react-uploader/core.css";

interface AddShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShopFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
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
      logo: null as string | null,
      banner: null as string | null,
      address: "",
      phone: "",
      email: "",
      enableNotification: false,
    },
    onSubmit: async ({ value, formApi }) => {
      await formApi.validateAllFields("blur");
      await formApi.validateAllFields("change");

      const hasErrors = Object.values(formApi.state.fieldMeta).some(
        (meta) => meta?.errors && meta.errors.length > 0,
      );

      if (hasErrors) {
        return;
      }

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

        <Form form={form} className="space-y-6">
          <div className="grid gap-4">
            <Field
              form={form}
              name="name"
              label="Shop Name"
              onBlur={validateField(shopSchema.shape.name)}
              onChange={validateOptionalField(shopSchema.shape.name)}
              placeholder="e.g. Tech Gadgets Store"
              required
            />

            <Field
              form={form}
              name="slug"
              label="Slug"
              onBlur={validateField(shopSchema.shape.slug)}
              onChange={validateOptionalField(shopSchema.shape.slug)}
              placeholder="e.g. tech-gadgets-store"
              description="URL-friendly identifier for your shop"
              required
            />

            <Field
              form={form}
              name="description"
              label="Description"
              onBlur={validateOptionalField(shopSchema.shape.description)}
              onChange={validateOptionalField(shopSchema.shape.description)}
              placeholder="Describe your shop..."
              as="textarea"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Logo Field */}
              <form.Field name="logo">
                {(field) => {
                  return (
                    <UIField>
                      <FieldLabel htmlFor={field.name}>Logo</FieldLabel>
                      <div className="space-y-2">
                        <FileUploaderMinimal
                          pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                          classNameUploader="uc-auto uc-purple"
                          sourceList="local, gdrive"
                          className="uc-auto uc-purple"
                          imgOnly
                          multiple={false}
                          onFileUploadSuccess={(e: any) => {
                            if (e?.cdnUrl) {
                              field.handleChange(e.cdnUrl);
                            }
                          }}
                        />
                        {field.state.value && (
                          <div className="relative size-20 overflow-hidden rounded-md border">
                            <img
                              src={field.state.value}
                              alt="Logo"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-5 w-5 rounded-tr-none rounded-bl-md px-0"
                              onClick={() => field.handleChange(null)}
                            >
                              <span className="sr-only">Remove</span>
                              <X className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </UIField>
                  );
                }}
              </form.Field>

              {/* Banner Field */}
              <form.Field name="banner">
                {(field) => {
                  return (
                    <UIField>
                      <FieldLabel htmlFor={field.name}>Banner</FieldLabel>
                      <div className="space-y-2">
                        <FileUploaderMinimal
                          pubkey={import.meta.env.VITE_UPLOADCARE_PUB_KEY!}
                          classNameUploader="uc-auto uc-purple"
                          sourceList="local, gdrive"
                          className="uc-auto uc-purple"
                          imgOnly
                          multiple={false}
                          onFileUploadSuccess={(e: any) => {
                            if (e?.cdnUrl) {
                              field.handleChange(e.cdnUrl);
                            }
                          }}
                        />
                        {field.state.value && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                            <img
                              src={field.state.value}
                              alt="Banner"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-5 w-5 rounded-tr-none rounded-bl-md px-0"
                              onClick={() => field.handleChange(null)}
                            >
                              <span className="sr-only">Remove</span>
                              <X className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </UIField>
                  );
                }}
              </form.Field>
            </div>

            <Field
              form={form}
              name="address"
              label="Address"
              onBlur={validateField(shopSchema.shape.address)}
              onChange={validateOptionalField(shopSchema.shape.address)}
              placeholder="e.g. 123 Tech St, Silicon Valley"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                form={form}
                name="phone"
                label="Phone"
                onBlur={validateField(shopSchema.shape.phone)}
                onChange={validateOptionalField(shopSchema.shape.phone)}
                placeholder="e.g. +1 234 567 8900"
                required
              />

              <form.Field
                name="email"
                children={(field) => (
                  <div>
                    <Label htmlFor={field.name} className="mb-2 block">
                      Notification Email (Coming Soon)
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter email for notifications"
                      disabled
                    />
                  </div>
                )}
              />
            </div>

            <form.Field
              name="enableNotification"
              children={(field) => (
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
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
              )}
            />

            <Separator />

            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-semibold">Payment Information</h4>
              <p className="text-muted-foreground text-sm">
                Stripe connection will be available soon to handle your payments
                securely.
              </p>
            </div>
          </div>

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
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Shop"}
                </Button>
              )}
            />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
