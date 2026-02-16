/**
 * Admin User Management Server Functions
 *
 * Server functions for managing users in the admin panel.
 * Uses TanStack Start's createServerFn with Better Auth admin plugin.
 */

import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { AdminUser, ListUsersResponse, UserRole } from "@/types/users";
import { auth } from "../auth";
import { db } from "../db";
import { user as userTable } from "../db/schema/auth-schema";
import { isUserAdmin } from "../helper/vendor";
import { authMiddleware } from "../middleware/auth";

// ============================================================================
// Helper: Transform raw user to AdminUser type
// ============================================================================

const transformUser = (u: any): AdminUser => ({
  id: u.id,
  name: u.name ?? u.email,
  email: u.email,
  image: u.image ?? undefined,
  role: (u.role ?? "customer") as UserRole,
  banned: u.banned ?? false,
  status: u.banned ? "banned" : "active",
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// ============================================================================
// Get Current User
// ============================================================================

export const currentUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.session;
  });

// ============================================================================
// Update User Profile
// ============================================================================

const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.url().optional().nullable(),
  orderEmailsEnabled: z.boolean().optional(),
});

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateUserProfileSchema)
  .handler(async ({ context, data }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized: User not found");
    }

    // Update user directly in the database
    const [updatedUser] = await db
      .update(userTable)
      .set({
        name: data.name,
        image: data.image || null,
        ...(data.orderEmailsEnabled !== undefined
          ? { orderEmailsEnabled: data.orderEmailsEnabled }
          : {}),
      })
      .where(eq(userTable.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        orderEmailsEnabled: updatedUser.orderEmailsEnabled,
      },
    };
  });

// ============================================================================
// Get Users List
// ============================================================================

export const getUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ListUsersResponse> => {
    const isAdmin = await isUserAdmin(context.session.user.id);
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Pass headers from context (set by authMiddleware) for Better Auth admin API
    const result = await auth.api.listUsers({
      query: { limit: 100 },
      headers: context.headers,
    });
    const rawUsers = (result as any)?.users ?? [];

    return {
      users: rawUsers.map(transformUser),
      total: rawUsers.length,
      limit: 100,
      offset: 0,
    };
  });
