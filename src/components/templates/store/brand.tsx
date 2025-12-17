import MarqueeBadge from "@/components/base/common/marquee-badge";
import Marquee from "@/components/containers/store/marquee";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
}

const brandsCategories = [
  "TANK TOP",
  "TSHIRT",
  "LONG-SLEEVE TSHIRT",
  "RAGLAN SLEEVE SHIRT",
  "CROP TOP",
  "V-NECK SHIRT",
  "MUSCLE SHIRT",
];

export default function Brand({ className }: BrandProps) {
  return (
    <section className={cn(className)}>
      <Marquee
        items={brandsCategories.map((c) => (
          <MarqueeBadge key={c} label={c} />
        ))}
        speed="slow"
        className="border-t-2"
      />
    </section>
  );
}
