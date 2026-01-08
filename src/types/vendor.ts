import type { LucideIcon } from "lucide-react";

export interface VendorNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  items?: {
    title: string;
    href: string;
  }[];
}
