import { cn } from "@/lib/utils";

interface FeatureGridItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconClassName?: string;
  outlineIcon: React.ReactNode;
  outlineIconClassName?: string;
  className?: string;
}
export default function FeatureGridItem({
  title,
  description,
  icon,
  iconClassName,
  outlineIcon,
  outlineIconClassName,
  className,
}: FeatureGridItemProps) {
  return (
    <div
      className={cn(
        "relative border-dashed @4xl:p-10 @6xl:p-[50px] @7xl:p-[60px] p-[30px]",
        className
      )}
    >
      <div
        className={cn(
          "@4xl:mb-10 @6xl:mb-[50px] mb-6 @6xl:size-24 size-[76px]",
          iconClassName
        )}
      >
        {icon}
      </div>
      <div className="space-y-3">
        <h4 className="@4xl:text-xl @6xl:text-2xl text-lg">{title}</h4>
        <p>{description}</p>
      </div>
      <div
        className={cn(
          "absolute top-0 right-0 size-[173px]",
          outlineIconClassName
        )}
      >
        {outlineIcon}
      </div>
    </div>
  );
}
