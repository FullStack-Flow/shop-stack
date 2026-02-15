import { eq } from "drizzle-orm";
import { db } from "../db";
import { shops } from "../db/schema/shop-schema";

export async function getShopBySlug(slug: string) {
  const shop = await db.query.shops.findFirst({
    where: eq(shops.slug, slug),
  });
  if (!shop) {
    throw new Error("Shop not found");
  }
  return shop;
}
