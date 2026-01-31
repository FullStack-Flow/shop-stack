import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
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
import { useSession } from "@/lib/auth/auth-client";
import { adminNavItems } from "@/lib/constants/admin.routes";

export default function AdminDashboardSidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ShopStack</span>
            <span className="truncate text-muted-foreground text-xs">
              Admin Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <VendorNavMenu items={adminNavItems} />
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
