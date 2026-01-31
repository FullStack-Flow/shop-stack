import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Form } from "@/components/base/forms/form";
import { Field } from "@/components/base/forms/form-field";
import { PhoneInput } from "@/components/base/forms/phone-input";
import { Button } from "@/components/ui/button";
import { registerVendor } from "@/lib/functions/vendor";
import { validateField, validateOptionalField } from "@/lib/helper/validators";
import type { VendorRegisterInput } from "@/lib/validators/auth";
import { passwordSchema, vendorRegisterSchema } from "@/lib/validators/auth";

interface VendorSignUpFormProps {
  onSuccess: () => void;
}

export default function VendorSignUpForm({ onSuccess }: VendorSignUpFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      storeName: "",
      storeDescription: "",
      contactPhone: "",
      countryCode: "BD",
      address: "",
    },
    onSubmit: async ({ value, formApi }) => {
      await formApi.validateAllFields("blur");
      await formApi.validateAllFields("change");

      const hasErrors = Object.values(formApi.state.fieldMeta).some(
        (meta) => meta?.errors && meta.errors.length > 0
      );

      if (hasErrors) {
        return;
      }

      setLoading(true);
      try {
        const result = await registerVendor({
          data: value as VendorRegisterInput,
        });

        if (result?.success) {
          toast.success("Vendor account created successfully!");
          toast.info(`Your shop "${result.shop.name}" is pending approval.`);
          onSuccess?.();
          navigate({ to: "/" });
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Form
        form={form}
        className="space-y-6"
        noValidate
        multiStep={{
          currentStep: step,
          totalSteps: 2,
          fieldNamesByStep: {
            1: ["name", "email", "password", "confirmPassword"] as const,
          },
          onStepChange: (newStep) => setStep(newStep as 1 | 2),
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
              step === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <div className="h-px w-8 bg-border" />
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
              step === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
        </div>

        {step === 1 && (
          <>
            <p className="text-center text-muted-foreground text-sm">
              Step 1: Personal Information
            </p>

            <Field
              form={form}
              name="name"
              label="Full Name"
              onBlur={validateField(vendorRegisterSchema.shape.name)}
              onChange={validateOptionalField(vendorRegisterSchema.shape.name)}
              placeholder="John Doe"
              autoComplete="name"
              required
            />

            <Field
              form={form}
              name="email"
              label="Email"
              onBlur={validateField(vendorRegisterSchema.shape.email)}
              onChange={validateOptionalField(vendorRegisterSchema.shape.email)}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              description="This will also be your store's contact email."
              required
            />

            <Field
              form={form}
              name="password"
              label="Password"
              onBlur={validateField(vendorRegisterSchema.shape.password)}
              onChange={validateOptionalField(
                vendorRegisterSchema.shape.password
              )}
              type={showPassword ? "text" : "password"}
              placeholder="8+ chars, strong password"
              autoComplete="new-password"
              description="At least 8 chars, one uppercase, one number, one symbol."
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <Field
              form={form}
              name="confirmPassword"
              label="Confirm Password"
              onBlur={({
                value,
                fieldApi,
              }: {
                value: unknown;
                fieldApi: any;
              }) => {
                const res = passwordSchema.safeParse(value);
                if (!res.success) return res.error.issues[0].message;
                if (fieldApi.form.getFieldValue("password") !== value) {
                  return "Passwords do not match";
                }
                return undefined;
              }}
              onChange={({
                value,
                fieldApi,
              }: {
                value: unknown;
                fieldApi: any;
              }) => {
                if (!value) return undefined;
                if (fieldApi.form.getFieldValue("password") !== value) {
                  return "Passwords do not match";
                }
                return undefined;
              }}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <Button type="submit" className="w-full">
              Continue to Store Setup
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-center text-muted-foreground text-sm">
              Step 2: Store Information
            </p>

            <Field
              form={form}
              name="storeName"
              label="Store Name"
              onBlur={validateField(vendorRegisterSchema.shape.storeName)}
              onChange={validateOptionalField(
                vendorRegisterSchema.shape.storeName
              )}
              placeholder="My Awesome Store"
              description="This will be displayed to customers."
              required
            />

            <Field
              form={form}
              name="storeDescription"
              label="Store Description"
              placeholder="Tell customers about your store..."
              as="textarea"
            />

            <form.Field
              name="contactPhone"
              children={(phoneField) => (
                <form.Field
                  name="countryCode"
                  children={(codeField) => (
                    <PhoneInput
                      phoneValue={phoneField.state.value}
                      countryCodeValue={codeField.state.value}
                      onPhoneChange={phoneField.handleChange}
                      onCountryCodeChange={codeField.handleChange}
                      error={
                        phoneField.state.meta.isTouched &&
                        phoneField.state.meta.errors[0]
                      }
                    />
                  )}
                />
              )}
            />

            <Field
              form={form}
              name="address"
              label="Store Address"
              placeholder="123 Market Street, City, State"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([_canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="flex-1"
                  >
                    {loading || isSubmitting
                      ? "Creating Account..."
                      : "Create Vendor Account"}
                  </Button>
                )}
              />
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
