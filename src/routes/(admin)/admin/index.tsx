import { createFileRoute } from "@tanstack/react-router";
import { Building2, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/(admin)/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Tenants",
      value: "24",
      change: "+3 new this month",
      icon: Building2,
    },
    {
      title: "Total Users",
      value: "1,234",
      change: "+180 from last month",
      icon: Users,
    },
    {
      title: "Total Orders",
      value: "5,432",
      change: "+1,234 from last month",
      icon: ShoppingBag,
    },
    {
      title: "Platform Revenue",
      value: "$234,567",
      change: "+12.5% from last month",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Platform-wide overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{stat.value}</div>
                <p className="text-muted-foreground text-xs">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex h-75 items-center justify-center text-muted-foreground">
              Chart placeholder - Platform metrics over time
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-75 items-center justify-center text-muted-foreground">
              Recent activity list placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
