import {
  Award,
  Building2,
  CreditCard,
  Home,
  Layers,
  List,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import type { VendorNavItem } from "@/types/vendor";

export const adminNavItems: VendorNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "My Store",
    href: "/admin/my-store",
    icon: Store,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Tags",
    href: "/admin/tags",
    icon: Tag,
  },
  {
    title: "Attributes",
    href: "/admin/attributes",
    icon: List,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: Award,
  },
  {
    title: "Taxes",
    href: "/admin/taxes",
    icon: Percent,
  },
  {
    title: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
  },
  {
    title: "Staff",
    href: "/admin/staff",
    icon: Users,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
