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

export const getShopByIdSchema = z.object({
  id: z.string().min(1, "Shop ID is required"),
});

export const updateShopStatusSchema = z.object({
  id: z.string().min(1, "Shop ID is required"),
  status: z.enum(["pending", "active", "suspended"]),
});

export const deleteShopByIdSchema = z.object({
  id: z.string().min(1, "Shop ID is required"),
});

export const updateVendorCommissionSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  commissionRate: z.string().min(1, "Commission rate is required"),
});

export type GetShopByIdInput = z.infer<typeof getShopByIdSchema>;
export type UpdateShopStatusInput = z.infer<typeof updateShopStatusSchema>;
export type DeleteShopByIdInput = z.infer<typeof deleteShopByIdSchema>;
export type UpdateVendorCommissionInput = z.infer<
  typeof updateVendorCommissionSchema
>;
