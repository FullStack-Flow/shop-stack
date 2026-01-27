import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  phoneValue: unknown;
  countryCodeValue: unknown;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  error?: unknown;
  required?: boolean;
}

const COUNTRY_CODES = [
  { value: "BD", label: "BD" },
  { value: "USA", label: "USA" },
  { value: "UK", label: "UK" },
  { value: "IND", label: "IND" },
] as const;

export function PhoneInput({
  phoneValue,
  countryCodeValue,
  onPhoneChange,
  onCountryCodeChange,
  error,
  required = true,
}: PhoneInputProps) {
  const isInvalid = Boolean(error);

  return (
    <Field data-invalid={isInvalid} className="flex-1">
      <FieldLabel required={required}>Phone number</FieldLabel>
      <div className="flex gap-2">
        <Select
          value={(countryCodeValue as string) ?? ""}
          onValueChange={onCountryCodeChange}
        >
          <SelectTrigger className="w-24 shadow-none" aria-invalid={isInvalid}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          value={(phoneValue as string) ?? ""}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="+880 1234567890"
          autoComplete="tel"
          className={cn("flex-1 shadow-none")}
          aria-invalid={isInvalid}
        />
      </div>
      {isInvalid && <FieldError>{String(error ?? "")}</FieldError>}
    </Field>
  );
}
