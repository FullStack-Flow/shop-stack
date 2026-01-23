// import { and, count, eq, inArray } from "drizzle-orm";
// import { db } from "../db";

// export async function getProductCountsForShops(
//   shopIds: string[],
// ): Promise<Map<string, number>> {
//   if (shopIds.length === 0) {
//     return new Map();
//   }

//   const productCounts = await db
//     .select({
//       shopId: products.shopId,
//       count: count(),
//     })
//     .from(products)
//     .where(and(eq(products.isActive, true), inArray(products.shopId, shopIds)))
//     .groupBy(products.shopId);

//   return new Map(productCounts.map((pc) => [pc.shopId, pc.count]));
// }
