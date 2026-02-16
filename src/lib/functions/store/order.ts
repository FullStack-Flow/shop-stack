import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { cartItems, cartSessions } from "@/lib/db/schema/cart-schema";
import { orderItems, orders, payments } from "@/lib/db/schema/order-schema";
import { products } from "@/lib/db/schema/products-schema";
import { shippingMethods } from "@/lib/db/schema/shipping-schema";
import { shops, vendors } from "@/lib/db/schema/shop-schema";
import { generateOrderNumber } from "@/lib/helper/order-helpers";
import { authMiddleware } from "@/lib/middleware/auth";
import { optionalAuthMiddleware } from "@/lib/middleware/optional-auth";
import {
  createPaymentIntent,
  dollarsToCents,
  getPaymentIntent,
} from "@/lib/stripe";
import { createDestinationCharge } from "@/lib/stripe/connect";
import { sendOrderConfirmationEmailForOrderId } from "@/lib/validators/emails/order-confirmation";
import {
  cancelOrderSchema,
  confirmPaymentSchema,
  createCheckoutSessionSchema,
  getOrderByIdSchema,
  getOrdersByIdsSchema,
  getOrdersSchema,
} from "@/lib/validators/order";
import type { CheckoutResult } from "@/types/orders";
import { createOrderNotification } from "../vendor";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(createCheckoutSessionSchema)
  .handler(async ({ context, data }): Promise<CheckoutResult> => {
    const userId = context.session?.user?.id;

    const {
      sessionId: guestSessionId,
      shippingAddress,
      billingAddress,
      useSameBillingAddress,
      shippingMethod,
      customerNotes,
      couponCodes,
    } = data;

    // Get cart session
    let cartSession:
      | { id: string; userId: string | null; sessionId: string | null }
      | undefined;
    if (userId) {
      cartSession = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.userId, userId),
      });
    } else if (guestSessionId) {
      cartSession = await db.query.cartSessions.findFirst({
        where: eq(cartSessions.sessionId, guestSessionId),
      });
    }

    if (!cartSession) {
      throw new Error("Cart not found");
    }

    const cartItemsWithProducts = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        variantOptions: cartItems.variantOptions,
        productName: products.name,
        productSku: products.sku,
        sellingPrice: products.sellingPrice,
        shopId: products.shopId,
        stock: products.stock,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartSessionId, cartSession.id));

    if (cartItemsWithProducts.length === 0) {
      throw new Error("Cart is empty");
    }

    const { productImages } = await import("@/lib/db/schema/products-schema");
    const productIds = cartItemsWithProducts.map((item) => item.productId);
    const images = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds));

    const imageMap = new Map<string, string>();
    for (const img of images) {
      if (!imageMap.has(img.productId) || img.isPrimary) {
        imageMap.set(img.productId, img.url);
      }
    }

    const itemsByShop = cartItemsWithProducts.reduce(
      (acc, item) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = [];
        }
        acc[item.shopId].push(item);
        return acc;
      },
      {} as Record<string, typeof cartItemsWithProducts>,
    );

    const shopIds = Object.keys(itemsByShop);
    await db
      .select({ id: shops.id, name: shops.name })
      .from(shops)
      .where(inArray(shops.id, shopIds));

    const [selectedShippingMethod] = await db
      .select({
        id: shippingMethods.id,
        shopId: shippingMethods.shopId,
        name: shippingMethods.name,
        price: shippingMethods.price,
      })
      .from(shippingMethods)
      .where(eq(shippingMethods.id, shippingMethod))
      .limit(1);

    if (!selectedShippingMethod) {
      throw new Error("Shipping method not found");
    }

    if (!shopIds.includes(selectedShippingMethod.shopId)) {
      throw new Error("Shipping method does not match cart items");
    }

    const shippingCost = Number(selectedShippingMethod.price);

    // Create orders for each shop
    const createdOrders: { id: string; total: number; shopId: string }[] = [];

    for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
      const orderId = uuidv4();
      const orderNumber = generateOrderNumber();

      // Calculate order total for this shop
      let subtotal = 0;
      for (const item of shopItems) {
        subtotal += parseFloat(item.sellingPrice) * item.quantity;
      }

      // Apply coupon discount if any
      const shopCoupon = couponCodes?.find((c) => c.shopId === shopId);
      const discountAmount = shopCoupon?.discountAmount || 0;

      // Calculate tax (5%)
      const taxAmount = (subtotal - discountAmount) * 0.05;

      // Total for this order
      const totalAmount = subtotal - discountAmount + taxAmount + shippingCost;

      // Create order
      await db.insert(orders).values({
        id: orderId,
        orderNumber,
        userId: userId || null,
        guestEmail: shippingAddress.email,
        shopId,
        status: "pending",
        paymentStatus: "pending",
        fulfillmentStatus: "unfulfilled",
        currency: "USD",
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingCost.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        shippingMethod,
        shippingAddress,
        billingAddress: useSameBillingAddress
          ? shippingAddress
          : billingAddress,
        customerNotes,
        couponCode: shopCoupon?.code,
        metadata: {},
      });

      // Create order items
      for (const item of shopItems) {
        await db.insert(orderItems).values({
          id: uuidv4(),
          orderId,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: imageMap.get(item.productId) || null,
          variantOptions: item.variantOptions
            ? JSON.parse(item.variantOptions)
            : null,
          unitPrice: item.sellingPrice,
          quantity: item.quantity,
          totalPrice: (parseFloat(item.sellingPrice) * item.quantity).toFixed(
            2,
          ),
          discountAmount: "0",
        });

        // Reduce stock
        if (item.stock !== null) {
          await db
            .update(products)
            .set({ stock: item.stock - item.quantity })
            .where(eq(products.id, item.productId));
        }
      }

      createdOrders.push({
        id: orderId,
        total: totalAmount,
        shopId,
      });
    }

    const grandTotal = createdOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    const uniqueShopIds = [...new Set(createdOrders.map((o) => o.shopId))];
    const isSingleVendor = uniqueShopIds.length === 1;

    let paymentResult: {
      clientSecret: string;
      paymentIntentId: string;
    } | null = null;
    let connectedAccountId: string | null = null;
    let applicationFeeAmount: number | null = null;

    if (isSingleVendor) {
      // Get vendor info for the single shop
      const shop = await db.query.shops.findFirst({
        where: eq(shops.id, uniqueShopIds[0]),
      });

      if (shop) {
        const vendor = await db.query.vendors.findFirst({
          where: eq(vendors.id, shop.vendorId),
        });

        // Use destination charge if vendor has connected account
        if (vendor?.stripeConnectedAccountId && vendor.stripeChargesEnabled) {
          const commissionRate =
            parseFloat(vendor.commissionRate || "20") / 100;
          applicationFeeAmount = grandTotal * commissionRate;
          connectedAccountId = vendor.stripeConnectedAccountId;

          try {
            paymentResult = await createDestinationCharge(
              dollarsToCents(grandTotal),
              "usd",
              connectedAccountId,
              dollarsToCents(applicationFeeAmount),
              {
                orderIds: createdOrders.map((o) => o.id).join(","),
                userId: userId || "guest",
                email: shippingAddress.email,
                vendorId: vendor.id,
              },
            );
          } catch (error) {
            const code = (error as { code?: unknown } | null)?.code;
            if (code === "insufficient_capabilities_for_transfer") {
              paymentResult = null;
              connectedAccountId = null;
              applicationFeeAmount = null;
            } else {
              throw error;
            }
          }
        }
      }
    }

    if (!paymentResult) {
      paymentResult = await createPaymentIntent(
        dollarsToCents(grandTotal),
        "usd",
        {
          orderIds: createdOrders.map((o) => o.id).join(","),
          userId: userId || "guest",
          email: shippingAddress.email,
        },
      );
    }

    if (!paymentResult) {
      throw new Error("Failed to create payment intent");
    }

    // Create payment record for each order
    for (const order of createdOrders) {
      await db.insert(payments).values({
        id: uuidv4(),
        orderId: order.id,
        paymentMethod: "card",
        provider: "stripe",
        amount: order.total.toFixed(2),
        currency: "USD",
        status: "pending",
        stripePaymentIntentId: paymentResult.paymentIntentId,
        stripeClientSecret: paymentResult.clientSecret,
        // Stripe Connect tracking
        connectedAccountId: connectedAccountId || undefined,
        applicationFeeAmount: applicationFeeAmount?.toFixed(2) || undefined,
      });
    }

    await db
      .delete(cartItems)
      .where(eq(cartItems.cartSessionId, cartSession.id));

    return {
      success: true,
      orderIds: createdOrders.map((o) => o.id),
      paymentIntentId: paymentResult.paymentIntentId,
      clientSecret: paymentResult.clientSecret,
      totalAmount: grandTotal,
    };
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(confirmPaymentSchema)
  .handler(async ({ data }) => {
    const { paymentIntentId, orderIds } = data;

    // Verify payment with Stripe
    const paymentIntent = await getPaymentIntent(paymentIntentId);

    if (!paymentIntent) {
      throw new Error("Payment intent not found");
    }

    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment not successful: ${paymentIntent.status}`);
    }

    // Update orders and payments
    for (const orderId of orderIds) {
      // Update order status
      await db
        .update(orders)
        .set({
          status: "confirmed",
          paymentStatus: "paid",
        })
        .where(eq(orders.id, orderId));

      // Update payment status
      await db
        .update(payments)
        .set({
          status: "succeeded",
          transactionId: paymentIntent.id,
        })
        .where(eq(payments.orderId, orderId));
    }

    const updatedOrders = await db.query.orders.findMany({
      where: inArray(orders.id, orderIds),
      with: { items: true },
    });

    for (const order of updatedOrders) {
      if (!order.shopId) continue;

      const customerName = order.shippingAddress
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
        : "Customer";

      await createOrderNotification({
        shopId: order.shopId,
        orderNumber: order.orderNumber,
        orderId: order.id,
        customerName,
        totalAmount: parseFloat(order.totalAmount),
        itemCount: order.items.length,
      });
    }

    await Promise.allSettled(
      orderIds.map((orderId) => sendOrderConfirmationEmailForOrderId(orderId)),
    );

    return {
      success: true,
      message: "Payment confirmed successfully",
    };
  });

export const getCustomerOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(getOrdersSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { limit, offset, status } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const conditions = [eq(orders.userId, userId)];
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    const customerOrders = await db.query.orders.findMany({
      where: and(...conditions),
      with: {
        items: true,
        shop: {
          columns: { id: true, name: true, slug: true },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
    });

    return {
      orders: customerOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        discountAmount: parseFloat(order.discountAmount),
        totalAmount: parseFloat(order.totalAmount),
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        shopId: order.shopId,
        shopName: order.shop?.name || "Unknown Store",
        shopSlug: order.shop?.slug || order.shopId,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          variantOptions: item.variantOptions,
          unitPrice: parseFloat(item.unitPrice),
          quantity: item.quantity,
          totalPrice: parseFloat(item.totalPrice),
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
    };
  });

export const getOrderById = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getOrderByIdSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderId } = data;

    const order = await db.query.orders.findFirst({
      where: or(eq(orders.id, orderId), eq(orders.orderNumber, orderId)),
      with: {
        items: true,
        shop: {
          columns: { id: true, name: true, slug: true },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Check access - either owner or guest order with matching email
    if (order.userId && order.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        discountAmount: parseFloat(order.discountAmount),
        totalAmount: parseFloat(order.totalAmount),
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        customerNotes: order.customerNotes,
        shopId: order.shopId,
        shopName: order.shop?.name || "Unknown Store",
        shopSlug: order.shop?.slug || order.shopId,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          variantOptions: item.variantOptions,
          unitPrice: parseFloat(item.unitPrice),
          quantity: item.quantity,
          totalPrice: parseFloat(item.totalPrice),
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    };
  });

export const getOrdersByIds = createServerFn({ method: "GET" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getOrdersByIdsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderIds, paymentIntentId } = data;

    const foundOrders = await db.query.orders.findMany({
      where: inArray(orders.id, orderIds),
      with: {
        items: true,
        shop: {
          columns: { id: true, name: true },
        },
      },
    });

    if (foundOrders.length === 0) {
      throw new Error("Orders not found");
    }

    // Security check
    // If authenticated, check ownership of all orders
    if (userId) {
      const allOwned = foundOrders.every((o) => o.userId === userId);
      if (!allOwned) {
        // Fallback: check payment intent if user might be checking a guest order they just placed (unlikely if logged in, but possible flow)
        // Strictly enforcing ownership for logged in users:
        if (!allOwned) throw new Error("Unauthorized");
      }
    } else {
      // If guest, require paymentIntentId verification
      if (!paymentIntentId) {
        throw new Error("Unauthorized");
      }

      // Check if all orders are linked to this payment intent
      // We need to check the payments table
      const paymentRecords = await db
        .select()
        .from(payments)
        .where(inArray(payments.orderId, orderIds));

      const allMatch = paymentRecords.every(
        (p) => p.stripePaymentIntentId === paymentIntentId,
      );

      if (!allMatch || paymentRecords.length !== orderIds.length) {
        throw new Error("Unauthorized access to orders");
      }
    }

    return {
      orders: foundOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.taxAmount),
        shippingAmount: parseFloat(order.shippingAmount),
        discountAmount: parseFloat(order.discountAmount),
        totalAmount: parseFloat(order.totalAmount),
        shippingMethod: order.shippingMethod,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        customerNotes: order.customerNotes,
        shopId: order.shopId,
        shopName: order.shop?.name || "Unknown Store",
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          variantOptions: item.variantOptions,
          unitPrice: parseFloat(item.unitPrice),
          quantity: item.quantity,
          totalPrice: parseFloat(item.totalPrice),
        })),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  });

export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(cancelOrderSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderId, reason } = data;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find the order
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new Error("This order cannot be cancelled");
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: "cancelled",
        internalNotes: reason
          ? `Customer cancelled: ${reason}`
          : "Customer cancelled",
      })
      .where(eq(orders.id, orderId));

    // Restore stock
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId),
      });

      if (product && product.stock !== null) {
        await db
          .update(products)
          .set({ stock: product.stock + item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    return {
      success: true,
      message: "Order cancelled successfully",
    };
  });

export const getOrderPaymentSession = createServerFn({ method: "POST" })
  .middleware([optionalAuthMiddleware])
  .inputValidator(getOrderByIdSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;
    const { orderId } = data;

    // Check order existence and ownership
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        payments: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Find the pending payment
    const payment = order.payments.find(
      (p) => p.status === "pending" && p.stripeClientSecret,
    );

    if (
      !payment ||
      !payment.stripeClientSecret ||
      !payment.stripePaymentIntentId
    ) {
      throw new Error("No pending payment found for this order");
    }

    // Find all orders associated with this payment intent
    const relatedPayments = await db.query.payments.findMany({
      where: eq(payments.stripePaymentIntentId, payment.stripePaymentIntentId),
      columns: { orderId: true, amount: true },
    });

    const orderIds = relatedPayments.map((p) => p.orderId);
    const totalAmount = relatedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    return {
      orderIds,
      paymentIntentId: payment.stripePaymentIntentId,
      clientSecret: payment.stripeClientSecret,
      totalAmount,
    };
  });
