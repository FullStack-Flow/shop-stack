import { Link } from "@tanstack/react-router";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../provider/mode-toggle";
import NotificationDropdown from "./notification-dropdown";

interface VendorHeaderProps {
  title?: string;
  showSearch?: boolean;
  className?: string;
  shopSlug?: string;
}

export default function VendorHeader({
  title = "Dashboard",
  showSearch = true,
  className,
  shopSlug,
}: VendorHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
        className,
      )}
    >
      <SidebarTrigger />

      <div className="flex flex-1 items-center gap-4">
        <h1 className="font-semibold text-lg md:text-xl">{title}</h1>

        {showSearch && (
          <div className="ml-auto flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-9" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Dropdown - only show if shopSlug is provided */}
        {shopSlug ? (
          <NotificationDropdown shopSlug={shopSlug} />
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/settings">
            <Settings className="size-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>

        <ModeToggle />
      </div>
    </header>
  );
}
