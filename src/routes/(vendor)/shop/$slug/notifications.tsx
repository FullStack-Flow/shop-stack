import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  Loader2,
  Package,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageSkeleton } from "@/components/base/common/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useVendorNotificationMutations,
  useVendorNotifications,
} from "@/hooks/vendors/use-vendor-notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(vendor)/shop/$slug/notifications")({
  component: NotificationsPage,
  pendingComponent: PageSkeleton,
});

const notificationIcons: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart className="size-4 text-green-500" />,
  order_status_update: <Package className="size-4 text-blue-500" />,
  new_review: <Star className="size-4 text-yellow-500" />,
  low_stock: <AlertTriangle className="size-4 text-orange-500" />,
  payout: <CreditCard className="size-4 text-emerald-500" />,
  system: <Info className="size-4 text-muted-foreground" />,
};

function NotificationsPage() {
  const { slug } = Route.useParams();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { notifications, unreadCount, isLoading } = useVendorNotifications({
    shopSlug: slug,
    limit: 50,
    refetchInterval: 30000,
  });

  const { markAsRead, markAllAsRead, isMarkingAllAsRead, isMarkingAsRead } =
    useVendorNotificationMutations(slug);

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
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-xl">Notifications</h2>
          {unreadCount > 0 && (
            <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-[10px] text-primary-foreground">
              <span className="-top-0.5 -right-0.5 absolute flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (!value) return;
              setFilter(value as "all" | "unread" | "read");
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="all" aria-label="All notifications">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="unread" aria-label="Unread notifications">
              Unread
            </ToggleGroupItem>
            <ToggleGroupItem value="read" aria-label="Read notifications">
              Read
            </ToggleGroupItem>
          </ToggleGroup>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="h-8 gap-1.5 text-xs"
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
      </div>

      <Card className="p-0">
        <ScrollArea className="max-h-160">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Bell className="size-10 text-muted-foreground/40" />
              <p className="mt-3 font-medium text-muted-foreground text-sm">
                No notifications yet
              </p>
              <p className="mt-1 text-muted-foreground/70 text-xs">
                You&apos;ll see new orders and alerts here
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Bell className="size-10 text-muted-foreground/40" />
              <p className="mt-3 font-medium text-muted-foreground text-sm">
                No notifications found
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5",
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {notificationIcons[notification.type] || (
                      <Bell className="size-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-tight",
                          !notification.isRead && "font-medium",
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="invisible size-6 shrink-0 group-hover:visible"
                          disabled={isMarkingAsRead}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="size-3" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs">
                      {notification.message}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>

                      {notification.data?.orderId && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <Link
                            to="/shop/$slug/orders/$orderId"
                            params={{
                              slug,
                              orderId: notification.data.orderId,
                            }}
                            className="font-medium text-[10px] text-primary hover:underline"
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            View order
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="-translate-y-1/2 absolute top-1/2 left-1.5 flex size-2 items-center justify-center">
                      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      <Separator />

      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
          <Link to="/shop/$slug" params={{ slug }}>
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
