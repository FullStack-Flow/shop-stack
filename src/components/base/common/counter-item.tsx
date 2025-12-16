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
        "border border-dashed p-[30px] @4xl:px-12 @7xl:px-[70px] @4xl:pb-8 @6xl:pb-[54px]",
        extraTop
          ? "@4xl:border-t-0 @4xl:pt-[58px] @6xl:pt-[88px]"
          : "@4xl:pt-16 @6xl:pt-[50px]"
      )}
    >
      <div className="font-extrabold @4xl:text-4xl @6xl:text-[50px] text-3xl text-foreground">
        {value}
      </div>
      <div className="@6xl:text-lg text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
