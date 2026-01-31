import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Home, Store } from "lucide-react";
import VendorNavMenu from "@/components/base/vendors/vendor-nav-menu";
import VendorUserMenu from "@/components/base/vendors/vendor-user-menu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useShops } from "@/hooks/vendors/use-shops";
import { useSession } from "@/lib/auth/auth-client";
import type { VendorNavItem } from "@/types/vendor";

export default function VendorDashboardSidebar() {
  const { data: session } = useSession();
  const { shopsQueryOptions } = useShops();
  const { data: shopData } = useQuery(shopsQueryOptions());
  const shopCount = shopData?.shops?.length ?? 0;

  const user = session?.user;

  const vendorNavItems: VendorNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "My Shops",
      href: "/my-shop",
      icon: Store,
      badge: shopCount > 0 ? shopCount : undefined,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-base">ShopStack</span>
            <span className="truncate text-muted-foreground text-sm">
              Vendor Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <VendorNavMenu items={vendorNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <VendorUserMenu user={user} />
        ) : (
          <Link to="/auth/sign-in">
            <Button
              variant="default"
              className="w-full"
              type="button"
              size="lg"
            >
              Sign In
            </Button>
          </Link>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
