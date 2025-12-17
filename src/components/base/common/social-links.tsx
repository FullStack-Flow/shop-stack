import { Link } from "@tanstack/react-router";
import { BadgeCheck, Dribbble, Instagram, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SocialLinksProps {
  links?: SocialLink[];
  className?: string;
}

const defaultLinks: SocialLink[] = [
  { label: "Instagram", href: "/#instagram", icon: Instagram },
  { label: "Dribbble", href: "/#dribbble", icon: Dribbble },
  { label: "Twitter", href: "https://x.com/home", icon: Twitter },
  { label: "Behance", href: "/#behance", icon: BadgeCheck },
];

export default function SocialLinks({
  links = defaultLinks,
  className,
}: SocialLinksProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center @5xl:gap-5 gap-4", className)}
    >
      {links.map((link) => (
        <Link
          to={link.href}
          key={link.label}
          aria-label={link.label}
          target="_blank"
          className={cn(
            "inline-flex @5xl:size-14 @7xl:size-16 size-12 items-center justify-center rounded-xl bg-primary-80 text-dark-06 transition-colors hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <link.icon className="@6xl:size-7 size-6" />
        </Link>
      ))}
    </div>
  );
}
