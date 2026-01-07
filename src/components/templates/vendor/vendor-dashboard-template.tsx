import StatsCard from "@/components/base/vendors/sates-card";
import DashboardChart from "@/components/containers/vendors/dashboard-chart";
import RecentSales from "@/components/containers/vendors/recent-sales";

interface VendorDashboardTemplateProps {
  stats: Array<{
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export default function VendorDashboardTemplate({
  stats,
}: VendorDashboardTemplateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your shops today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 @xl:grid-cols-2 @2xl:grid-cols-7">
        <DashboardChart className="col-span-4" />
        <RecentSales className="col-span-3" />
      </div>
    </div>
  );
}
