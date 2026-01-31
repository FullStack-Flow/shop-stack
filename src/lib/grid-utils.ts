/**
 * Grid utility functions for Tailwind CSS
 * These functions help generate static grid classes that can be properly analyzed by Tailwind
 */

/**
 * Maps grid column numbers to their corresponding Tailwind classes
 */
export const getGridColsClass = (cols: number): string => {
  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  };
  return gridColsMap[cols] || "grid-cols-2";
};

/**
 * Maps grid column numbers and breakpoints to their corresponding responsive Tailwind classes
 */
export const getResponsiveGridColsClass = (
  cols: number,
  breakpoint: "@xl" | "@2xl" | "@5xl" | "@7xl"
): string => {
  const responsiveMap: Record<string, Record<number, string>> = {
    "@xl": {
      1: "@xl:grid-cols-1",
      2: "@xl:grid-cols-2",
      3: "@xl:grid-cols-3",
      4: "@xl:grid-cols-4",
      5: "@xl:grid-cols-5",
      6: "@xl:grid-cols-6",
      7: "@xl:grid-cols-7",
      8: "@xl:grid-cols-8",
      9: "@xl:grid-cols-9",
      10: "@xl:grid-cols-10",
      11: "@xl:grid-cols-11",
      12: "@xl:grid-cols-12",
    },
    "@2xl": {
      1: "@2xl:grid-cols-1",
      2: "@2xl:grid-cols-2",
      3: "@2xl:grid-cols-3",
      4: "@2xl:grid-cols-4",
      5: "@2xl:grid-cols-5",
      6: "@2xl:grid-cols-6",
      7: "@2xl:grid-cols-7",
      8: "@2xl:grid-cols-8",
      9: "@2xl:grid-cols-9",
      10: "@2xl:grid-cols-10",
      11: "@2xl:grid-cols-11",
      12: "@2xl:grid-cols-12",
    },
    "@5xl": {
      1: "@5xl:grid-cols-1",
      2: "@5xl:grid-cols-2",
      3: "@5xl:grid-cols-3",
      4: "@5xl:grid-cols-4",
      5: "@5xl:grid-cols-5",
      6: "@5xl:grid-cols-6",
      7: "@5xl:grid-cols-7",
      8: "@5xl:grid-cols-8",
      9: "@5xl:grid-cols-9",
      10: "@5xl:grid-cols-10",
      11: "@5xl:grid-cols-11",
      12: "@5xl:grid-cols-12",
    },
    "@7xl": {
      1: "@7xl:grid-cols-1",
      2: "@7xl:grid-cols-2",
      3: "@7xl:grid-cols-3",
      4: "@7xl:grid-cols-4",
      5: "@7xl:grid-cols-5",
      6: "@7xl:grid-cols-6",
      7: "@7xl:grid-cols-7",
      8: "@7xl:grid-cols-8",
      9: "@7xl:grid-cols-9",
      10: "@7xl:grid-cols-10",
      11: "@7xl:grid-cols-11",
      12: "@7xl:grid-cols-12",
    },
  };
  return responsiveMap[breakpoint]?.[cols] || "";
};

/**
 * Type for grid column configuration
 */
export interface GridColumnsConfig {
  default?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}
