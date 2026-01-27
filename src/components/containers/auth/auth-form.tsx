import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { Form } from "@/components/base/forms/form";
import { Field } from "@/components/base/forms/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { authClient, signIn, signUp, twoFactor } from "@/lib/auth/auth-client";
import { validateField, validateOptionalField } from "@/lib/helper/validators";
import {
  loginSchema,
  passwordSchema,
  registerSchema,
} from "@/lib/validators/auth";
import { TwoFactorForm } from "./two-factor-form";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  onSuccess?: () => void;
  includeSocial?: boolean;
  redirectUrl?: string;
}

export default function AuthForm({
  mode,
  onSuccess,
  includeSocial = true,
  redirectUrl,
}: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const form = useForm({
    defaultValues:
      mode === "sign-in"
        ? { email: "", password: "", rememberMe: true }
        : { name: "", email: "", password: "", confirmPassword: "" },
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
        if (mode === "sign-in") {
          const loginValue = value;
          const res = await signIn.email({
            email: loginValue.email,
            password: loginValue.password,
            rememberMe: loginValue.rememberMe,
          });

          if (res.error) {
            toast.error(res.error.message || "Sign in failed");
          } else if (
            res.data &&
            "twoFactorRedirect" in res.data &&
            res.data.twoFactorRedirect
          ) {
            // User has 2FA enabled - send OTP immediately
            try {
              const otpRes = await twoFactor.sendOtp({});
              if (otpRes.error) {
                console.error("Failed to send OTP:", otpRes.error);
                toast.error(
                  "Failed to send verification code. Please try again."
                );
                return;
              }
              toast.info("A verification code has been sent to your email");
            } catch (otpErr) {
              console.error("OTP send error:", otpErr);
              // Still show 2FA form even if OTP send fails - user can resend
            }
            setRequires2FA(true);
          } else {
            toast.success("Signed in successfully!");
            onSuccess?.();
          }
        } else {
          const { ...payload } = value;
          const res = await signUp.email({
            email: payload.email,
            password: payload.password,
            name: payload.name!,
          });

          if (res.error) {
            toast.error(res.error.message || "Sign up failed");
          } else {
            toast.success("Account created successfully!");
            onSuccess?.();
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Show 2FA verification form if required
  if (requires2FA) {
    return (
      <TwoFactorForm
        onSuccess={onSuccess}
        onCancel={() => setRequires2FA(false)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Form form={form} className="space-y-6" noValidate>
        {mode === "sign-up" && (
          <Field
            form={form}
            name="name"
            label="Full Name"
            onBlur={validateField(registerSchema.shape.name)}
            onChange={validateOptionalField(registerSchema.shape.name)}
            placeholder="John Doe"
            autoComplete="name"
            description="Your display name."
            required
          />
        )}

        <Field
          form={form}
          name="email"
          label="Email"
          onBlur={validateField(loginSchema.shape.email)}
          onChange={validateOptionalField(loginSchema.shape.email)}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          description="We'll never share your email."
          required
        />

        <Field
          form={form}
          name="password"
          label="Password"
          onBlur={validateField(
            mode === "sign-in"
              ? loginSchema.shape.password
              : registerSchema.shape.password
          )}
          onChange={
            mode === "sign-in"
              ? validateOptionalField(loginSchema.shape.password)
              : validateOptionalField(registerSchema.shape.password)
          }
          type="password"
          placeholder={
            mode === "sign-in" ? "Your password" : "8+ chars, strong password"
          }
          autoComplete={
            mode === "sign-in" ? "current-password" : "new-password"
          }
          description={
            mode === "sign-up"
              ? "At least 8 characters, one uppercase, one number, one symbol."
              : undefined
          }
          required
        />

        {mode === "sign-up" && (
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
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />
        )}

        {mode === "sign-in" && (
          <form.Field
            name="rememberMe"
            children={(field) => (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={Boolean(field.state.value)}
                    onChange={(e) =>
                      field.handleChange((e.target as HTMLInputElement).checked)
                    }
                  />
                  <Label htmlFor={field.name}>Remember me</Label>
                </div>
              </div>
            )}
          />
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([_canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full"
              size="lg"
            >
              {loading
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          )}
        />
      </Form>

      {includeSocial && (
        <div className="space-y-3">
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                authClient.signIn.social({
                  provider: "github",
                  callbackURL: redirectUrl || "/",
                })
              }
              type="button"
            >
              GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: redirectUrl || "/",
                })
              }
              type="button"
            >
              Google
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
