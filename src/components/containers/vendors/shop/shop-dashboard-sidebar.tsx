import { Link } from "@tanstack/react-router";
import { ArrowLeft, Store } from "lucide-react";
import VendorNavMenu from "@/components/base/vendors/vendor-nav-menu";
import VendorUserMenu from "@/components/base/vendors/vendor-user-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useSession } from "@/lib/auth/auth-client";
import { getShopNavItems } from "@/lib/constants/vendors.routes";

interface ShopSidebarProps {
  shopName: string;
  shopSlug: string;
}

export default function ShopDashboardSidebar({
  shopName,
  shopSlug,
}: ShopSidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex flex-col gap-4 px-2 py-4">
          <Button variant="ghost" className="justify-start gap-2" asChild>
            <Link to="/my-shop">
              <ArrowLeft className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Back to Shops
              </span>
            </Link>
          </Button>

          <Separator className="bg-sidebar-border" />

          {/* Shop Logo and Text */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-6" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-bold text-base">{shopName}</span>
              <span className="truncate text-muted-foreground text-sm">
                Shop Dashboard
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shop Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <VendorNavMenu items={getShopNavItems(shopSlug)} />
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
