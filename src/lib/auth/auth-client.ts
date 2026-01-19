import { twoFactorClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_BETTER_AUTH_URL) ||
  process.env.BETTER_AUTH_URL ||
  "/api/auth";

export const authClient = createAuthClient({
  baseURL,
  plugins: [twoFactorClient()],
});
export const { signIn, signOut, signUp, useSession, getSession, twoFactor } =
  authClient;
