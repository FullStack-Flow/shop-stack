import type { VendorNavItem } from "@/types/vendor";
import {
  Briefcase,
  CreditCard,
  FileText,
  Home,
  Landmark,
  Package,
  ShoppingBag,
  Star,
  Tag,
  Tags,
  Users,
} from "lucide-react";

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
    title: "Staff",
    href: `/shop/${shopSlug}/staff`,
    icon: Users,
  },
];
