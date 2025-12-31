import ProfileTemplate from "@/components/templates/store/accounts/profile-template";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(store)/_layout/profile")({
  component: ProfileTemplate,
});
