import { Minus, Plus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm";
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
  size = "default",
}: QuantitySelectorProps) {
  const buttonSize = size === "sm" ? "icon-xs" : "icon-sm";
  const containerHeight = size === "sm" ? "h-8" : "h-10";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <InputGroup className={cn("w-auto", containerHeight, className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          variant="default"
          size={buttonSize}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease quantity"
        >
          <Minus className={iconSize} />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        value={value}
        onChange={handleInputChange}
        className={cn(
          "w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "default" ? "text-base" : "text-sm"
        )}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          variant="default"
          size={buttonSize}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase quantity"
        >
          <Plus className={iconSize} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
