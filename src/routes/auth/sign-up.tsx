import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/components/templates/auth/sign-up-page";

export const Route = createFileRoute("/auth/sign-up")({
  component: () => <SignUpPage />,
});
