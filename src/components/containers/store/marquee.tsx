import { cn } from "@/lib/utils";
import { ReactElement } from "react";

interface MarqueeProps {
  items: ReactElement[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

const speedMap: Record<NonNullable<MarqueeProps["speed"]>, string> = {
  slow: "animation-duration-[50s]",
  normal: "animation-duration-[35s]",
  fast: "animation-duration-[20s]",
};

export default function Marquee({ items, className, speed }: MarqueeProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y-2 border-dashed",
        className
      )}
    >
      <div
        className={cn(
          "marquee flex w-max min-w-full items-center gap-6 @5xl:py-10 @7xl:py-12 py-[30px]",
          speedMap[speed ?? "normal"]
        )}
        aria-label="Brand"
      >
        {[
          ...items.map((el) => ({ el, key: el.key ?? undefined })),
          ...items.map((el) => ({ el, key: `${el.key ?? "dup"}` })),
        ].map((n, idx) => (
          <div
            key={String(n.key ?? `mk-${idx}`)}
            className="flex items-center gap-3"
          >
            {n.el}
          </div>
        ))}
      </div>
    </div>
  );
}
