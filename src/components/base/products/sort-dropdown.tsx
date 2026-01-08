import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'rating'
  | 'best-selling';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export default function SortDropdown({
  value,
  onChange,
  className,
}: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevance</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="newest">Newest Arrivals</SelectItem>
        <SelectItem value="rating">Top Rated</SelectItem>
        <SelectItem value="best-selling">Best Selling</SelectItem>
      </SelectContent>
    </Select>
  );
}
