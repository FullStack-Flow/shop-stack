import type React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

interface ColorRadioItemProps {
  color: string;
  value: string;
  id: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#EF4444",
  Blue: "#3B82F6",
  Green: "#22C55E",
  Yellow: "#EAB308",
  Purple: "#A855F7",
  Pink: "#EC4899",
  Grey: "#6B7280",
  Beige: "#F5F5DC",
};

// Standalone ColorSwatch for display purposes (not for selection in RadioGroup)
export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  selected,
  onClick,
  className,
}) => {
  const hex = colorMap[color] || color;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "size-6 shrink-0 rounded-full border-2 border-gray-200 shadow-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        selected &&
          "scale-110 border-primary ring-2 ring-primary ring-offset-1",
        className
      )}
      style={{ backgroundColor: hex }}
      title={color}
      aria-label={`Select color ${color}`}
    />
  );
};

// ColorRadioItem for use within RadioGroup
export const ColorRadioItem: React.FC<ColorRadioItemProps> = ({
  color,
  value,
  id,
  className,
}) => {
  const hex = colorMap[color] || color;

  return (
    <RadioGroupItem
      value={value}
      id={id}
      className={cn(
        "size-6 shrink-0 rounded-full border-2 border-gray-200 shadow-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:scale-110 data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary data-[state=checked]:ring-offset-1",
        className
      )}
      style={{ backgroundColor: hex }}
      title={color}
      aria-label={`Select color ${color}`}
    />
  );
};
