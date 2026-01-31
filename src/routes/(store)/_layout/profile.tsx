import { createFileRoute } from "@tanstack/react-router";
import ProfileTemplate from "@/components/templates/store/accounts/profile/profile-template";

export const Route = createFileRoute("/(store)/_layout/profile")({
  component: ProfileTemplate,
});
