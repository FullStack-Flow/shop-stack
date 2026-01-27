import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreFilters } from "@/types/store-types";

interface StoreSearchProps {
  filters: StoreFilters;
  onSearchChange: (search: string) => void;
}

export default function StoreSearch({
  filters,
  onSearchChange,
}: StoreSearchProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="search">Search Stores</Label>
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
