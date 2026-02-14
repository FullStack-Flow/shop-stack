/**
 * Vendor Settings Template
 *
 * Main template for vendor shop settings with tabs for different settings categories.
 * Follows the same pattern as AdminSettingsTemplate.
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDisconnectStripe,
  useGetStripeDashboard,
  useStartStripeOnboarding,
  vendorStripeStatusQueryOptions,
} from "@/hooks/vendors/use-vendor-stripe-connect";

// ============================================================================
// Types
// ============================================================================

interface VendorSettingsTemplateProps {
  shopSlug: string;
  defaultTab?: "general" | "payments";
  stripeOnboardingStatus?: "success" | "refresh";
}

// ============================================================================
// Main Template
// ============================================================================

export const VendorSettingsTemplate = ({
  shopSlug,
  defaultTab = "general",
  stripeOnboardingStatus,
}: VendorSettingsTemplateProps) => {
  const navigate = useNavigate();

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    navigate({
      to: ".",
      search: { tab: value as "general" | "payments" },
      replace: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your shop preferences and configurations
          </p>
        </div>
      </div>

      <Tabs
        value={defaultTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="payments">Payment Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Configure general settings for your shop.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Shop profile settings will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentSettingsSection
            shopSlug={shopSlug}
            onboardingStatus={stripeOnboardingStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ============================================================================
// Payment Settings Section
// ============================================================================

interface PaymentSettingsSectionProps {
  shopSlug: string;
  onboardingStatus?: "success" | "refresh";
}

function PaymentSettingsSection({
  shopSlug,
  onboardingStatus,
}: PaymentSettingsSectionProps) {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // Fetch Stripe account status using query options pattern
  const {
    data: stripeStatus,
    isPending,
    refetch,
  } = useQuery(vendorStripeStatusQueryOptions(shopSlug));

  // Start onboarding mutation using dedicated hook
  const startOnboardingMutation = useStartStripeOnboarding({
    onSuccess: (data) => {
      setIsRedirecting(true);
      window.location.href = data.url;
    },
  });

  // Get dashboard link mutation using dedicated hook
  const getDashboardMutation = useGetStripeDashboard({
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
  });

  // Disconnect mutation
  const disconnectMutation = useDisconnectStripe(shopSlug, {
    onSuccess: () => {
      setShowDisconnectDialog(false);
      refetch();
    },
  });

  // Handle onboarding callback - clear URL params after processing
  useEffect(() => {
    if (onboardingStatus === "success") {
      refetch();
      // Clear the stripe_onboarding param by updating URL
      navigate({
        to: ".",
        search: { tab: "payments" },
        replace: true,
      });
    }
  }, [onboardingStatus, refetch, navigate]);

  // Handle start onboarding
  const handleStartOnboarding = () => {
    startOnboardingMutation.mutate({
      shopSlug,
      returnPath: "settings?tab=payments",
    });
  };

  // Loading state
  if (isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const status = stripeStatus;

  return (
    <>
      {/* Show success message if just completed onboarding */}
      {onboardingStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Onboarding Complete</AlertTitle>
          <AlertDescription>
            Your Stripe account has been successfully connected. You can now
            receive payments!
          </AlertDescription>
        </Alert>
      )}

      {/* Show refresh message if onboarding was interrupted */}
      {onboardingStatus === "refresh" && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Onboarding Interrupted</AlertTitle>
          <AlertDescription>
            It looks like your Stripe onboarding was interrupted. Please click
            the button below to continue.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Stripe Connect
                {status?.isConnected && status.chargesEnabled && (
                  <Badge variant="default" className="bg-green-600">
                    Connected
                  </Badge>
                )}
                {status?.isConnected && !status.chargesEnabled && (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Connect your Stripe account to receive payments from customers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.isConnected ? (
            // Not connected - show connect button
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                To receive payments, you need to connect your Stripe account.
                This allows us to securely transfer funds to your bank account.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleStartOnboarding}
                  disabled={startOnboardingMutation.isPending || isRedirecting}
                  size="lg"
                >
                  {startOnboardingMutation.isPending || isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Connect with Stripe
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : status.requiresAction ? (
            // Connected but needs action
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  Please complete the remaining requirements to enable payments.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleStartOnboarding}
                disabled={startOnboardingMutation.isPending || isRedirecting}
              >
                {startOnboardingMutation.isPending || isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Complete Onboarding"
                )}
              </Button>
            </div>
          ) : (
            // Fully connected
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      Onboarding Complete
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    {status.chargesEnabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-sm">
                      {status.chargesEnabled
                        ? "Charges Enabled"
                        : "Charges Pending"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    {status.payoutsEnabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-sm">
                      {status.payoutsEnabled
                        ? "Payouts Enabled"
                        : "Payouts Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => getDashboardMutation.mutate()}
                  disabled={getDashboardMutation.isPending}
                >
                  {getDashboardMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Open Stripe Dashboard
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDisconnectDialog(true)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Stripe Account?</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Stripe account? This
              will:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-sm">• Delete your Stripe Express account</p>
            <p className="text-sm">• Stop you from receiving new payments</p>
            <p className="text-sm">• Remove all payment configuration</p>
            <p className="text-sm font-semibold text-destructive">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDisconnectDialog(false)}
              disabled={disconnectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
