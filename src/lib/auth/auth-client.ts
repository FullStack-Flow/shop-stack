import { adminClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_BETTER_AUTH_URL) ||
  process.env.BETTER_AUTH_URL ||
  "/api/auth";

export const authClient = createAuthClient({
  baseURL,
  plugins: [adminClient(), twoFactorClient()],
});
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  admin,
  twoFactor,
} = authClient;
