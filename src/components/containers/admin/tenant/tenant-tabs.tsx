import { CheckCircle2, Loader2, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminShops } from "@/hooks/admin/use-admin-shops";
import type { AdminTenantDetailsProps } from "@/types/tenant";

export default function TenantTabs({ tenant }: AdminTenantDetailsProps) {
  const { updateCommission, isUpdatingCommission } = useAdminShops();
  const baseCommissionRate = tenant.commissionRate ?? "10.00";
  const [commissionRate, setCommissionRate] = useState(baseCommissionRate);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCommissionRate(baseCommissionRate);
    setHasChanges(false);
  }, [baseCommissionRate]);

  const handleCommissionChange = (value: string) => {
    setCommissionRate(value);
    setHasChanges(value !== baseCommissionRate);
  };

  const handleSaveCommission = async () => {
    if (tenant.vendorId && hasChanges) {
      await updateCommission({
        vendorId: tenant.vendorId,
        commissionRate,
      });
      setHasChanges(false);
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="commission">Commission</TabsTrigger>
        <TabsTrigger value="owner">Owner Info</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Basic information about the store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-muted-foreground text-sm">
                  Description
                </span>
                <p>{tenant.description}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground text-sm">
                  Store URL
                </span>
                <p className="cursor-pointer text-blue-600 underline">
                  https://shopstack.com/{tenant.slug}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="commission" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="size-5" />
              Commission Settings
            </CardTitle>
            <CardDescription>
              Set the platform fee for this vendor. This percentage will be
              deducted from each sale as an application fee.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={commissionRate}
                      onChange={(e) => handleCommissionChange(e.target.value)}
                      className="max-w-50"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Enter a value between 0 and 100
                  </p>
                </div>
                <div>
                  <Label>Current Effective Rate</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">
                      {baseCommissionRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveCommission}
                  disabled={
                    !hasChanges || isUpdatingCommission || !tenant.vendorId
                  }
                >
                  {isUpdatingCommission ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Commission Rate"
                  )}
                </Button>
                {hasChanges && (
                  <span className="text-muted-foreground text-sm">
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-4 font-medium">Stripe Connect Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Connected Account
                  </span>
                  <p className="flex items-center gap-2">
                    {tenant.stripeConnectedAccountId ? (
                      <>
                        <CheckCircle2 className="size-4 text-green-600" />
                        Connected
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Onboarding Status
                  </span>
                  <p className="flex items-center gap-2">
                    {tenant.stripeOnboardingComplete ? (
                      <>
                        <CheckCircle2 className="size-4 text-green-600" />
                        Complete
                      </>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Charges Enabled
                  </span>
                  <p className="flex items-center gap-2">
                    {tenant.stripeChargesEnabled ? (
                      <>
                        <CheckCircle2 className="size-4 text-green-600" />
                        Yes
                      </>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground text-sm">
                    Payouts Enabled
                  </span>
                  <p className="flex items-center gap-2">
                    {tenant.stripePayoutsEnabled ? (
                      <>
                        <CheckCircle2 className="size-4 text-green-600" />
                        Yes
                      </>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="owner" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Details about the account owner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={tenant.owner.avatar}
                  alt={tenant.owner.name}
                />
                <AvatarFallback>
                  {tenant.owner.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{tenant.owner.name}</h3>
                <p className="text-muted-foreground">{tenant.owner.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Subscription details and billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg capitalize">
                  {tenant.plan} Plan
                </h3>
                <p className="text-muted-foreground">Billed monthly</p>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
