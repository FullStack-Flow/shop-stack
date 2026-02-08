import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  productShippingMethods,
  products,
} from "@/lib/db/schema/products-schema";
import { shippingMethods } from "@/lib/db/schema/shipping-schema";

export const getAvailableShippingMethods = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      productIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    const { productIds } = data;
    if (!productIds || productIds.length === 0) return [];

    // 1. Get products to identify the shop (assuming single shop for now)
    const productsList = await db
      .select({ shopId: products.shopId })
      .from(products)
      .where(inArray(products.id, productIds));

    if (productsList.length === 0) return [];

    // Check if multiple shops (simple validation)
    const shopId = productsList[0].shopId;
    const allSameShop = productsList.every((p) => p.shopId === shopId);
    if (!allSameShop) {
      // TODO: Handle multi-shop cart.
      return [];
    }

    // 2. Get all active shipping methods for the shop
    const shopMethods = await db
      .select()
      .from(shippingMethods)
      .where(
        and(
          eq(shippingMethods.shopId, shopId),
          eq(shippingMethods.isActive, true),
        ),
      );

    // 3. Get product specific restrictions
    const productRestrictions = await db
      .select()
      .from(productShippingMethods)
      .where(inArray(productShippingMethods.productId, productIds));

    const productMethodMap = new Map<string, Set<string>>();

    // Optimization: If no restrictions found at all, return all shop methods
    if (productRestrictions.length === 0) {
      return shopMethods;
    }

    for (const pr of productRestrictions) {
      if (!productMethodMap.has(pr.productId)) {
        productMethodMap.set(pr.productId, new Set());
      }
      productMethodMap.get(pr.productId)!.add(pr.shippingMethodId);
    }

    // 4. Filter shopMethods
    const validMethods = shopMethods.filter((method) => {
      // A method is valid if for every product in the cart:
      // - The product has NO restrictions (supports all)
      // OR
      // - The product has restrictions AND this method is in the allowed set.

      return productIds.every((pid) => {
        const allowedMethods = productMethodMap.get(pid);
        if (!allowedMethods) return true; // No restrictions
        return allowedMethods.has(method.id);
      });
    });

    return validMethods;
  });
