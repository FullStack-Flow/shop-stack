import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface ActiveFilter {
  id: string;
  label: string;
  type: string;
}

interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onRemove: (id: string, type: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-muted-foreground text-sm">
        Active Filters:
      </span>
      {filters.map((filter) => (
        <Badge
          key={`${filter.type}-${filter.id}`}
          variant="secondary"
          className="gap-1 py-1 pr-1 pl-2"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full p-0.5 hover:bg-muted-foreground/20"
            onClick={() => onRemove(filter.id, filter.type)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </Button>
        </Badge>
      ))}
      <Button
        variant="link"
        size="sm"
        onClick={onClearAll}
        className="h-auto px-2 text-muted-foreground hover:text-primary"
      >
        Clear All
      </Button>
    </div>
  );
}
