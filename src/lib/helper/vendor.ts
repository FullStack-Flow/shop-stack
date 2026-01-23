import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema/auth-schema";
import { vendors } from "../db/schema/shop-schema";

export const getVendorForUser = async (userId: string) => {
  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.userId, userId),
  });
  return vendor;
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const [userData] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));
  return userData?.role === "admin";
};
