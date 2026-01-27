import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaContainerProps {
  className?: string;
  inline?: boolean;
}

export default function CtaContainer({ className, inline }: CtaContainerProps) {
  if (inline) {
    return (
      <div className={cn("flex w-full items-center", className)}>
        <Link to="/" className="@4xl:w-auto w-full">
          <Button
            variant="secondary"
            size="lg"
            type="button"
            className="@4xl:w-auto w-full gap-1.5"
          >
            Shop Now
            <ArrowUpRight className="size-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn("@4xl:px-12 @6xl:px-15 @7xl:px-20 px-5 pb-8", className)}
    >
      <div className="flex w-full items-center justify-end">
        <Link to="/">
          <Button
            variant="secondary"
            size="lg"
            type="button"
            className="gap-1.5"
          >
            Shop Now
            <ArrowUpRight className="size-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
