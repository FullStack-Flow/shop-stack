import { cn } from "@/lib/utils";

interface CounterItemProps {
  label: string;
  value: string;
  extraTop?: boolean;
}

export default function CounterItem({
  label,
  value,
  extraTop,
}: CounterItemProps) {
  return (
    <div
      className={cn(
        "border border-dashed p-7.5 @4xl:px-12 @7xl:px-17.5 @4xl:pb-8 @6xl:pb-13.5",
        extraTop
          ? "@4xl:border-t-0 @4xl:pt-14.5 @6xl:pt-22"
          : "@4xl:pt-16 @6xl:pt-12.5"
      )}
    >
      <div className="font-extrabold @4xl:text-4xl @6xl:text-[50px] text-3xl text-foreground">
        {value}
      </div>
      <div className="@6xl:text-lg text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
