import z from "zod";

export const adminShopsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  search: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  sortBy: z
    .enum(["name", "createdAt", "totalProducts", "totalOrders"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type AdminShopsQuery = z.infer<typeof adminShopsQuerySchema>;
