import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { VendorSettingsTemplate } from "@/components/templates/vendor/shop-settings-template";

const settingsSearchSchema = z.object({
  tab: z.enum(["general", "payments"]).optional().default("general"),
  stripe_onboarding: z.enum(["success", "refresh"]).optional(),
});

export const Route = createFileRoute("/(vendor)/shop/$slug/settings")({
  component: RouteComponent,
  validateSearch: (search) => settingsSearchSchema.parse(search),
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { tab, stripe_onboarding } = Route.useSearch();

  return (
    <VendorSettingsTemplate
      shopSlug={slug}
      defaultTab={tab}
      stripeOnboardingStatus={stripe_onboarding}
    />
  );
}
