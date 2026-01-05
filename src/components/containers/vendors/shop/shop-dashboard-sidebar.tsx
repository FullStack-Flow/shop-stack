import { VendorNavItem } from "@/types/vendor";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
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
import VendorNavMenu from "@/components/base/vendors/vendor-nav-menu";
import VendorUserMenu from "@/components/base/vendors/vendor-user-menu";

interface ShopSidebarProps {
  shopName: string;
  shopSlug: string;
}

// Mock user data - replace with actual user data from auth context
const mockUser = {
  name: "John Vendor",
  email: "john@vendor.com",
  avatar: "",
  role: "Vendor",
};

export default function ShopDashboardSidebar({
  shopName,
  shopSlug,
}: ShopSidebarProps) {
  const shopNavItems: VendorNavItem[] = [
    {
      title: "Dashboard",
      href: `/shop/${shopSlug}`,
      icon: Home,
    },
    {
      title: "Products",
      href: `/shop/${shopSlug}/products`,
      icon: Package,
    },
    {
      title: "Orders",
      href: `/shop/${shopSlug}/orders`,
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      href: `/shop/${shopSlug}/customers`,
      icon: Users,
    },
    {
      title: "Analytics",
      href: `/shop/${shopSlug}/analytics`,
      icon: BarChart3,
    },
    {
      title: "Reports",
      href: `/shop/${shopSlug}/reports`,
      icon: FileText,
    },
    {
      title: "Settings",
      href: `/shop/${shopSlug}/settings`,
      icon: Settings,
    },
  ];

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
            <VendorNavMenu items={shopNavItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <VendorUserMenu user={mockUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
