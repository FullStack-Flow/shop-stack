import { createMiddleware } from "@tanstack/react-start";
import { auth } from "../auth";

/**
 * Optional Auth Middleware
 *
 * Similar to authMiddleware, but doesn't redirect if not authenticated.
 * Passes the session (or null) to the context, allowing server functions
 * to work both authenticated and unauthenticated.
 */
export const optionalAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    let session = null;

    try {
      session = await auth.api.getSession({
        headers: request.headers,
      });
    } catch {
      // No valid session - that's okay for optional auth
    }

    return next({
      context: { session, headers: request.headers },
    });
  },
);
