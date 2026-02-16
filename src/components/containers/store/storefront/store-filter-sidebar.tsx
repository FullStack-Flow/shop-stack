import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StoreFilters } from "@/types/store-types";

const categories = [
  "All Categories",
  "Groceries",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Books",
];

const ratingOptions = [
  { value: 0, label: "All Ratings" },
  { value: 4, label: "4+ Stars" },
  { value: 4.5, label: "4.5+ Stars" },
];

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A-Z)" },
];

interface StoreFilterSidebarProps {
  filters: StoreFilters;
  onFilterChange: (filters: Partial<StoreFilters>) => void;
  onReset: () => void;
}

export default function StoreFilterSidebar({
  filters,
  onFilterChange,
  onReset,
}: StoreFilterSidebarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.minRating > 0 ||
    filters.verifiedOnly;

  const handleSearchChange = (search: string) => {
    onFilterChange({ search });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ category: value === "All Categories" ? "" : value });
  };

  const handleRatingChange = (value: string) => {
    onFilterChange({ minRating: Number(value) });
  };

  const handleVerifiedChange = (checked: boolean) => {
    onFilterChange({ verifiedOnly: checked });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value as any });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-5" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1 text-xs"
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Stores</Label>
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category || "All Categories"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <Label>Minimum Rating</Label>
        <RadioGroup
          value={filters.minRating.toString()}
          onValueChange={handleRatingChange}
        >
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value.toString()}
                id={`rating-${option.value}`}
              />
              <Label
                htmlFor={`rating-${option.value}`}
                className="flex cursor-pointer items-center gap-1 font-normal"
              >
                {option.value > 0 && (
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                )}
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Verified Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={filters.verifiedOnly}
          onCheckedChange={handleVerifiedChange}
        />
        <Label
          htmlFor="verified"
          className="cursor-pointer font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Verified stores only
        </Label>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
