import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import SignInPage from "@/components/templates/auth/sign-in-page";

const signInSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: signInSearchSchema,
  component: () => <SignInPage />,
});
