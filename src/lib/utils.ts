import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gridCellBorderClasses(
  index: number,
  columns2 = 2,
  columns3 = 3,
  includeTop = true
) {
  const left4 = index % columns2 !== 0;
  const left6 = index % columns3 !== 0;
  return twMerge(
    clsx(
      "border-dashed border-r-0 border-b-0",
      includeTop ? "border-t-2" : "border-t-0",
      left4 ? "@4xl:border-l-2" : "@4xl:border-l-0",
      left6 ? "@6xl:border-l-2" : "@6xl:border-l-0"
    )
  );
}
