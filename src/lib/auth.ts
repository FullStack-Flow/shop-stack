import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "./db";
import {
  account,
  session,
  twoFactor as twoFactorTable,
  user,
  verification,
} from "./db/schema/auth-schema";
import { sendEmail } from "./email";
import OtpEmail from "./emails/otp-email";

export const auth = betterAuth({
  // Base path where auth routes are mounted
  basePath: "/api/auth",

  // App name for TOTP issuer
  appName: "Shop Stack",

  // Security-related configuration
  // Use a deterministic dev secret if env is missing to prevent runtime errors
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret",
  trustedOrigins: [
    // Local development
    process.env.VITE_BETTER_AUTH_URL!,
    // Optionally add your production app URL via env
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],

  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  // Advanced security options
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    disableCSRFCheck: false,
    ipAddress: {
      // Ensure rate limit/session IP tracking works behind proxies/CDNs if applicable
      ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"],
    },
  },

  // Built-in rate limiting
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    // Use in-memory storage to avoid missing DB tables in dev
    storage: "memory",
    // Apply stricter limits to sensitive endpoints
    customRules: {
      "/sign-in/email": { window: 10, max: 3 },
      "/sign-up/email": { window: 10, max: 3 },
    },
  },

  // Optional social providers if configured via env variables
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [
    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        async sendOTP({ user, otp }) {
          try {
            const result = await sendEmail({
              to: user.email!,
              subject: "Your OTP Code",
              body: OtpEmail({
                otp,
                userName: user.name || user.email || "User",
                expiresInMinutes: 5,
              }),
            });
            console.log(
              "Email sent successfully! Message ID:",
              result.messageId,
            );
          } catch (error) {
            console.error("Failed to send OTP email:", error);
            throw new Error("Failed to send verification code");
          }
        },
      },
    }),
    tanstackStartCookies(), // make sure this is the last plugin in the array
  ],

  // Drizzle adapter with explicit schema mapping
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
      twoFactor: twoFactorTable,
    },
  }),
});
