import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CreditCard,
  Info,
  Loader2,
  Package,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useVendorNotificationMutations,
  useVendorNotifications,
} from "@/hooks/vendors/use-vendor-notifications";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  shopSlug: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart className="size-4 text-green-500" />,
  order_status_update: <Package className="size-4 text-blue-500" />,
  new_review: <Star className="size-4 text-yellow-500" />,
  low_stock: <AlertTriangle className="size-4 text-orange-500" />,
  payout: <CreditCard className="size-4 text-emerald-500" />,
  system: <Info className="size-4 text-muted-foreground" />,
};

export function NotificationDropdown({ shopSlug }: NotificationDropdownProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const { notifications, unreadCount, isLoading } = useVendorNotifications({
    shopSlug,
    limit: 20,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { markAsRead, markAllAsRead, isMarkingAllAsRead } =
    useVendorNotificationMutations(shopSlug);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (filter === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [filter, notifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="-top-0.5 -right-0.5 absolute flex size-5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/20 opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-105 p-0" align="end" sideOffset={8}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="shrink-0 space-y-3 border-b bg-muted/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 font-medium text-[10px] text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="h-7 gap-1.5 px-2 text-xs hover:bg-transparent hover:text-primary"
                >
                  {isMarkingAllAsRead ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <CheckCheck className="size-3" />
                  )}
                  Mark all read
                </Button>
              )}
            </div>
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(value) => {
                if (!value) return;
                setFilter(value as "all" | "unread" | "read");
              }}
              className="w-full justify-start"
            >
              <ToggleGroupItem
                value="all"
                aria-label="All notifications"
                className="h-7 flex-1 rounded-sm text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="unread"
                aria-label="Unread notifications"
                className="h-7 flex-1 rounded-sm text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Unread
              </ToggleGroupItem>
              <ToggleGroupItem
                value="read"
                aria-label="Read notifications"
                className="h-7 flex-1 rounded-sm text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Read
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Notification List */}
          <ScrollArea className="h-87.5">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="size-6 text-muted-foreground/50" />
                </div>
                <p className="mt-3 font-medium text-sm">No notifications</p>
                <p className="mt-1 max-w-50 text-muted-foreground text-xs">
                  {filter === "unread"
                    ? "You're all caught up! Check 'All' to see past notifications."
                    : "You haven't received any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative flex gap-4 border-b p-4 transition-colors hover:bg-muted/40",
                      !notification.isRead &&
                        "bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-4 right-4 flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm",
                        !notification.isRead && "border-primary/20",
                      )}
                    >
                      {notificationIcons[notification.type] || (
                        <Bell className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="mr-4">
                        <p
                          className={cn(
                            "text-sm leading-none",
                            !notification.isRead
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground",
                          )}
                        >
                          {notification.title}
                        </p>
                      </div>
                      <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-muted-foreground/60">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                        {notification.data?.orderId && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <Link
                              to="/shop/$slug/orders/$orderId"
                              params={{
                                slug: shopSlug,
                                orderId: notification.data.orderId,
                              }}
                              className="font-medium text-[10px] text-primary hover:underline"
                              onClick={() => {
                                if (!notification.isRead) {
                                  handleMarkAsRead(notification.id);
                                }
                              }}
                            >
                              View details
                            </Link>
                          </>
                        )}
                        {!notification.isRead && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="font-medium text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                            >
                              Mark as read
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="shrink-0 border-t bg-muted/10 p-2">
              <Link to="/shop/$slug/notifications" params={{ slug: shopSlug }}>
                <Button
                  variant="ghost"
                  className="h-9 w-full justify-center text-muted-foreground text-xs hover:text-foreground"
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationDropdown;
