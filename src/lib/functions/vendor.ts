import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../db/schema/auth-schema";
import { notifications } from "../db/schema/notification-schema";
import { shops, vendors } from "../db/schema/shop-schema";
import { generateSlug } from "../utils/slug";
import { vendorRegisterSchema } from "../validators/auth";

export const registerVendor = createServerFn({ method: "POST" })
  .inputValidator(vendorRegisterSchema)
  .handler(async ({ data }) => {
    const {
      name,
      email,
      password,
      storeName,
      storeDescription,
      contactPhone,
      address,
    } = data;

    let userId: string | null = null;

    try {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      const shopSlug = generateSlug(storeName);
      const existingShop = await db.query.shops.findFirst({
        where: eq(shops.slug, shopSlug),
      });

      if (existingShop) {
        throw new Error(
          "A shop with this name already exists. Please try a different shop name.",
        );
      }

      const signUpResult = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error("Failed to create user account");
      }

      userId = signUpResult.user.id;

      await db.update(user).set({ role: "vendor" }).where(eq(user.id, userId));

      const vendorId = crypto.randomUUID();

      await db.insert(vendors).values({
        id: vendorId,
        userId: userId,
        businessName: storeName,
        contactEmail: email,
        contactPhone: contactPhone || null,
        address: address || null,
        status: "pending_approval",
      });

      const shopId = crypto.randomUUID();

      await db.insert(shops).values({
        id: shopId,
        vendorId: vendorId,
        name: storeName,
        slug: shopSlug,
        description: storeDescription || null,
        email: email,
        phone: contactPhone || null,
        address: address || null,
        status: "pending",
      });

      return {
        success: true,
        user: {
          id: userId,
          name,
          email,
          role: "vendor",
        },
        vendor: {
          id: vendorId,
          status: "pending_approval",
        },
        shop: {
          id: shopId,
          slug: shopSlug,
          name: storeName,
          status: "pending",
        },
      };
    } catch (error) {
      console.error("Vendor registration error:", error);

      if (userId) {
        console.warn(
          `Vendor registration failed after user creation. User ID: ${userId}`,
        );
        // Attempt to revert user role to 'customer' if vendor creation failed
        try {
          await db
            .update(user)
            .set({ role: "customer" })
            .where(eq(user.id, userId));
          console.log(`Reverted user ${userId} role to customer after failure`);
        } catch (revertError) {
          console.error("Failed to revert user role:", revertError);
        }

        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to register vendor. Please try again.",
        );
      }
    }
  });

export async function createOrderNotification(params: {
  shopId: string;
  orderNumber: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
}) {
  const [existing] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.shopId, params.shopId),
        eq(notifications.type, "new_order"),
        sql`(${notifications.data} ->> 'orderId') = ${params.orderId}`,
      ),
    )
    .limit(1);

  if (existing?.id) {
    return { id: existing.id };
  }

  const id = uuidv4();

  await db.insert(notifications).values({
    id,
    shopId: params.shopId,
    type: "new_order",
    title: "New Order Received! 🎉",
    message: `${params.customerName} placed an order for ${params.itemCount} item(s) - $${params.totalAmount.toFixed(2)}`,
    data: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.totalAmount,
      link: `/shop/orders/${params.orderId}`,
    },
    isRead: false,
  });

  return { id };
}
