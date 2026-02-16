import { Link } from "@tanstack/react-router";
import {
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

const quickActions: QuickAction[] = [
  {
    label: "View Orders",
    icon: ShoppingBag,
    href: "/admin/orders",
    variant: "default",
  },
  {
    label: "Manage Shops",
    icon: Store,
    href: "/admin/tenants",
    variant: "outline",
  },
  {
    label: "View Products",
    icon: Package,
    href: "/admin/products",
    variant: "outline",
  },
  {
    label: "Manage Users",
    icon: Users,
    href: "/admin/customers",
    variant: "outline",
  },
  {
    label: "Coupons",
    icon: Tag,
    href: "/admin/coupons",
    variant: "outline",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
    variant: "outline",
  },
];

export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant={action.variant || "outline"}
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link to={action.href}>
                <action.icon className="size-5" />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
