import type z from "zod";

export function validateField(schema: z.ZodType<any, any>) {
  return ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value);
    return result.success ? undefined : result.error.issues[0].message;
  };
}

export function validateOptionalField(schema: z.ZodType<any, any>) {
  return ({ value }: { value: unknown }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    if (value === "") return undefined;

    const result = schema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  };
}
