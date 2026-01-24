/**
 * Admin Middleware
 *
 * Server middleware that requires the user to be authenticated AND have an admin role.
 * Use this for admin-only routes and server functions.
 */

import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "../auth";
import { isUserAdmin } from "../helper/vendor";

export const adminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Redirect to sign-in if no valid session
    if (!session || !session.user) {
      const url = new URL(request.url);
      const redirectTo = url.pathname + url.search;
      throw redirect({
        to: "/auth/sign-in",
        search: { redirectTo: redirectTo },
      });
    }

    const isAdmin = await isUserAdmin(session.user.id);

    if (!isAdmin) {
      throw redirect({
        to: "/forbiden",
      });
    }

    return next({
      context: { session, headers: request.headers, isAdmin },
    });
  },
);
