import StarburstIcon from "@/components/ui/icons/starburst-icon";

export default function MarqueeBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center @5xl:gap-4 gap-3">
      <StarburstIcon className="@5xl:size-[50px] @7xl:size-[60px] size-10 text-primary" />
      <span className="@5xl:text-2xl @7xl:text-3xl text-body-20 text-xl uppercase">
        {label}
      </span>
    </span>
  );
}
