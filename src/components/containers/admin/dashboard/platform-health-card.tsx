import {
  CheckCircle,
  Clock,
  CreditCard,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformHealthProps {
  data: {
    vendors: {
      total: number;
      stripeConnected: number;
      pendingOnboarding: number;
      active: number;
      pendingApproval: number;
    };
    shops: {
      total: number;
      active: number;
      pending: number;
      suspended: number;
    };
  } | null;
  isLoading?: boolean;
}

export function PlatformHealthCard({
  data,
  isLoading = false,
}: PlatformHealthProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const vendorConnectedPercent =
    data.vendors.total > 0
      ? (data.vendors.stripeConnected / data.vendors.total) * 100
      : 0;

  const shopActivePercent =
    data.shops.total > 0 ? (data.shops.active / data.shops.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vendors Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="font-medium">Vendors</span>
            <span className="ml-auto text-muted-foreground text-sm">
              {data.vendors.total} total
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CreditCard className="size-3 text-green-500" />
                Stripe Connected
              </span>
              <span>
                {data.vendors.stripeConnected} (
                {vendorConnectedPercent.toFixed(0)}%)
              </span>
            </div>
            <Progress value={vendorConnectedPercent} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <CheckCircle className="size-3 text-green-500" />
              <span>Active: {data.vendors.active}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Clock className="size-3 text-amber-500" />
              <span>Pending: {data.vendors.pendingApproval}</span>
            </div>
          </div>
        </div>

        {/* Shops Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Store className="size-4 text-muted-foreground" />
            <span className="font-medium">Shops</span>
            <span className="ml-auto text-muted-foreground text-sm">
              {data.shops.total} total
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="size-3 text-green-500" />
                Active Shops
              </span>
              <span>
                {data.shops.active} ({shopActivePercent.toFixed(0)}%)
              </span>
            </div>
            <Progress value={shopActivePercent} className="h-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Clock className="size-3 text-amber-500" />
              <span>Pending: {data.shops.pending}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <ShieldAlert className="size-3 text-red-500" />
              <span>Suspended: {data.shops.suspended}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
