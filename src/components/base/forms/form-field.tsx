import type * as React from 'react';
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError as UiFieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return undefined;
}

type FieldRenderProp = {
  state: {
    value: unknown;
    meta: { isTouched: boolean; isValid: boolean; errors: unknown[] };
  };
  handleChange: (...args: unknown[]) => void;
  handleBlur: () => void;
};

type InputFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'onBlur'> & {
    type?: 'text' | 'email' | 'tel' | 'password' | 'number';
    value?: unknown;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    field?: FieldRenderProp;
  };

type TextareaFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange' | 'onBlur'> & {
    value?: unknown;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    field?: FieldRenderProp;
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
  type = 'text',
  className,
  description,
  ...props
}: InputFieldProps) {
  const fieldValue = field ? field.state.value : value;
  const fieldChange = field ? field.handleChange : onChange;
  const fieldBlur = field ? field.handleBlur : onBlur;
  const fieldError = field
    ? field.state.meta.isTouched && !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined
    : error;

  const isInvalid = Boolean(fieldError);

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={props.id || props.name} required={required}>
        {label}
      </FieldLabel>
      <Input
        type={type}
        id={props.id || props.name}
        name={props.name}
        value={String(fieldValue ?? '')}
        onBlur={() => fieldBlur?.()}
        onChange={(e) => fieldChange?.(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <UiFieldError>{getErrorMessage(fieldError)}</UiFieldError>}
    </Field>
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
  ...props
}: TextareaFieldProps) {
  const fieldValue = field ? field.state.value : value;
  const fieldChange = field ? field.handleChange : onChange;
  const fieldBlur = field ? field.handleBlur : onBlur;
  const fieldError = field
    ? field.state.meta.isTouched && !field.state.meta.isValid
      ? field.state.meta.errors[0]
      : undefined
    : error;

  const isInvalid = Boolean(fieldError);

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={props.id || props.name} required={required}>
        {label}
      </FieldLabel>
      <Textarea
        id={props.id || props.name}
        name={props.name}
        value={String(fieldValue ?? '')}
        onBlur={() => fieldBlur?.()}
        onChange={(e) => fieldChange?.(e.target.value)}
        placeholder={placeholder}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <UiFieldError>{getErrorMessage(fieldError)}</UiFieldError>}
    </Field>
  );
}
