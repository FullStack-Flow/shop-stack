import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "../auth";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      const url = new URL(request.url);
      const redirectTo = url.pathname + url.search;
      throw redirect({
        to: "/auth/sign-in",
        search: { redirectTo },
      });
    }

    return next({
      context: { session, headers: request.headers },
    });
  }
);
