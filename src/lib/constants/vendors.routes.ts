import {
  Briefcase,
  CreditCard,
  FileText,
  Home,
  Landmark,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Tags,
  TruckElectric,
  Users,
} from "lucide-react";
import type { VendorNavItem } from "@/types/vendor";

export const getShopNavItems = (shopSlug: string): VendorNavItem[] => [
  {
    title: "Overview",
    href: `/shop/${shopSlug}`,
    icon: Home,
  },
  {
    title: "Products",
    href: `/shop/${shopSlug}/products`,
    icon: Package,
  },
  {
    title: "Coupons",
    href: `/shop/${shopSlug}/coupons`,
    icon: Tag,
  },
  {
    title: "Orders",
    href: `/shop/${shopSlug}/orders`,
    icon: ShoppingBag,
  },
  {
    title: "Categories",
    href: `/shop/${shopSlug}/categories`,
    icon: Tags,
  },
  {
    title: "Tags",
    href: `/shop/${shopSlug}/tags`,
    icon: Tag,
  },
  {
    title: "Brands",
    href: `/shop/${shopSlug}/brands`,
    icon: Briefcase,
  },
  {
    title: "Attributes",
    href: `/shop/${shopSlug}/attributes`,
    icon: FileText,
  },
  {
    title: "Reviews",
    href: `/shop/${shopSlug}/reviews`,
    icon: Star,
  },
  {
    title: "Transactions",
    href: `/shop/${shopSlug}/transactions`,
    icon: CreditCard,
  },
  {
    title: "Taxes",
    href: `/shop/${shopSlug}/taxes`,
    icon: Landmark,
  },
  {
    title: "Shipping Methods",
    href: `/shop/${shopSlug}/shipping`,
    icon: TruckElectric,
  },
  {
    title: "Staff",
    href: `/shop/${shopSlug}/staff`,
    icon: Users,
  },
  {
    title: "Settings",
    href: `/shop/${shopSlug}/settings`,
    icon: Settings,
  },
];
