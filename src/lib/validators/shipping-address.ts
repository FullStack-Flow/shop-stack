import * as z from "zod";

export const shippingAddressSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  countryCode: z.string(),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "Zip code must be at least 4 characters"),
  description: z.string().optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
