import { createFileRoute } from "@tanstack/react-router";
import VendorSignUpPage from "@/components/templates/auth/vendor-sign-up-page";

export const Route = createFileRoute("/auth/vendor-sign-up")({
  component: () => <VendorSignUpPage />,
});
