import type { ReactNode } from "react";
import VendorHeader from "@/components/base/vendors/vendor-header";
import ShopDashboardSidebar from "@/components/containers/vendors/shop/shop-dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ShopDashboardLayoutProps {
  children: ReactNode;
  shopName: string;
  shopSlug: string;
  headerTitle?: string;
  showSearch?: boolean;
  className?: string;
}

export default function ShopDashboardLayout({
  children,
  shopName,
  shopSlug,
  headerTitle,
  showSearch = true,
  className,
}: ShopDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <ShopDashboardSidebar shopName={shopName} shopSlug={shopSlug} />
      <SidebarInset>
        <VendorHeader
          title={headerTitle || `${shopName} Dashboard`}
          showSearch={showSearch}
        />
        <main
          className={cn(
            "flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6",
            className
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
