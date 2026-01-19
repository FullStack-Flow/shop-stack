import z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Must contain at least one uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Must contain at least one lowercase letter",
  })
  .refine((val) => /\d/.test(val), {
    message: "Must contain at least one number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Must contain at least one special character",
  });

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Vendor Registration Schema
export const vendorRegisterSchema = z
  .object({
    // Personal info
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    // Store info
    storeName: z.string().min(2, "Store name must be at least 2 characters"),
    storeDescription: z.string().optional(),
    contactPhone: z.string().optional(),
    countryCode: z.string().optional().default("BD"),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;
