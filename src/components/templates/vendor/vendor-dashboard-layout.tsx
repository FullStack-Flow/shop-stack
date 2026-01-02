import VendorHeader from "@/components/base/vendors/vendor-header";
import VendorDashboardSidebar from "@/components/containers/vendors/vendor-dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface VendorDashboardLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  showSearch?: boolean;
  className?: string;
}

export default function VendorDashboardLayout({
  children,
  headerTitle = "Dashboard",
  showSearch = true,
  className,
}: VendorDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <VendorDashboardSidebar />
      <SidebarInset>
        <VendorHeader title={headerTitle} showSearch={showSearch} />
        <main
          className={cn(
            "@container flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6",
            className
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
