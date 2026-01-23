import type * as React from "react";
import {
  FieldDescription,
  FieldLabel,
  Field as UiField,
  FieldError as UiFieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  description?: React.ReactNode;
  error?: unknown;
}

// Helper to safely extract error string
function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return undefined;
}

type FieldRenderProp = {
  state: {
    value: any;
    meta: { isTouched: boolean; isValid: boolean; errors: any[] };
  };
  handleChange: (value: any) => void;
  handleBlur: () => void;
};

type InputFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur"> & {
    type?: "text" | "email" | "tel" | "password" | "number";
    value?: unknown;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    field?: FieldRenderProp;
    suffix?: React.ReactNode;
  };

type TextareaFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<"textarea">, "value" | "onChange" | "onBlur"> & {
    value?: unknown;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    field?: FieldRenderProp;
    suffix?: React.ReactNode;
  };

export function FormTextField({
  label,
  required,
  placeholder,
  autoComplete,
  error,
  value,
  onChange,
  onBlur,
  field,
  type = "text",
  className,
  description,
  suffix,
  ...props
}: InputFieldProps) {
  const fieldValue = field ? field.state.value : value;
  const fieldChange = field ? field.handleChange : onChange;
  const fieldBlur = field ? field.handleBlur : onBlur;
  const fieldError = field
    ? (field.state.meta.isTouched || field.state.meta.errors.length > 0) &&
      !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined
    : error;

  const isInvalid = Boolean(fieldError);

  return (
    <UiField data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={props.id || props.name} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          type={type}
          id={props.id || props.name}
          name={props.name}
          value={String(fieldValue ?? "")}
          onBlur={() => fieldBlur?.()}
          onChange={(e) => fieldChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={isInvalid}
          className={suffix ? "pr-10" : undefined}
          {...props}
        />
        {suffix && (
          <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <UiFieldError>{getErrorMessage(fieldError)}</UiFieldError>}
    </UiField>
  );
}

export function FormTextareaField({
  label,
  required,
  placeholder,
  description,
  error,
  value,
  onChange,
  onBlur,
  field,
  className,
  suffix,
  ...props
}: TextareaFieldProps) {
  const fieldValue = field ? field.state.value : value;
  const fieldChange = field ? field.handleChange : onChange;
  const fieldBlur = field ? field.handleBlur : onBlur;
  const fieldError = field
    ? (field.state.meta.isTouched || field.state.meta.errors.length > 0) &&
      !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined
    : error;

  const isInvalid = Boolean(fieldError);

  return (
    <UiField data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={props.id || props.name} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <Textarea
          id={props.id || props.name}
          name={props.name}
          value={String(fieldValue ?? "")}
          onBlur={() => fieldBlur?.()}
          onChange={(e) => fieldChange?.(e.target.value)}
          placeholder={placeholder}
          aria-invalid={isInvalid}
          className={suffix ? "pr-10" : undefined}
          {...props}
        />
        {suffix && (
          <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <UiFieldError>{getErrorMessage(fieldError)}</UiFieldError>}
    </UiField>
  );
}

type FormFieldValidator = (props: any) => unknown;

type WrapperInputProps = Omit<
  InputFieldProps,
  "field" | "value" | "onChange" | "onBlur" | "error" | "form"
> & {
  form: { Field: (props: any) => any };
  name: string;
  onBlur?: FormFieldValidator;
  onChange?: FormFieldValidator;
  as?: "input";
};

type WrapperTextareaProps = Omit<
  TextareaFieldProps,
  "field" | "value" | "onChange" | "onBlur" | "error" | "form"
> & {
  form: { Field: (props: any) => any };
  name: string;
  onBlur?: FormFieldValidator;
  onChange?: FormFieldValidator;
  as: "textarea";
};

export function Field(props: WrapperInputProps | WrapperTextareaProps) {
  const { form, name, onBlur, onChange, as, ...rest } = props;

  const validators: Record<string, FormFieldValidator> = {};
  if (onBlur) validators.onBlur = onBlur;
  if (onChange) validators.onChange = onChange;

  return (
    <form.Field
      name={name}
      {...(Object.keys(validators).length > 0 ? { validators } : {})}
      children={(field: FieldRenderProp) =>
        as === "textarea" ? (
          <FormTextareaField
            {...(rest as Omit<
              WrapperTextareaProps,
              "form" | "name" | "onBlur" | "onChange" | "as"
            >)}
            name={name}
            field={field}
          />
        ) : (
          <FormTextField
            {...(rest as Omit<
              WrapperInputProps,
              "form" | "name" | "onBlur" | "onChange" | "as"
            >)}
            name={name}
            field={field}
          />
        )
      }
    />
  );
}
