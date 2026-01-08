import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PaginationProps = {
  pageIndex: number;
  pageSize: number;
  pageCount: number; // -1 for unknown (server)
  total?: number;
  onPageChange: (
    updater: (prev: { pageIndex: number; pageSize: number }) => {
      pageIndex: number;
      pageSize: number;
    }
  ) => void;
  pageSizeOptions?: number[];
};

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPageChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const canPrev = pageIndex > 0;
  // when pageCount === -1 we can't know last page; allow next but let server decide
  const canNext = pageCount === -1 ? true : pageIndex + 1 < pageCount;

  return (
    <div
      className="flex w-full items-center justify-between px-2 py-2"
      role="navigation"
      aria-label="Table pagination"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          Page <strong>{pageIndex + 1}</strong>
        </span>
        <span className="text-muted-foreground text-sm">• Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            onPageChange(() => ({ pageIndex: 0, pageSize: Number(value) }))
          }
        >
          <SelectTrigger className="h-8 w-25">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        {typeof total === 'number' ? (
          <span className="text-muted-foreground text-sm" aria-live="polite">
            {total} total
          </span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onPageChange(({ pageIndex: i, pageSize: s }) => ({
              pageIndex: Math.max(i - 1, 0),
              pageSize: s,
            }))
          }
          disabled={!canPrev}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onPageChange(({ pageIndex: i, pageSize: s }) => ({
              pageIndex: i + 1,
              pageSize: s,
            }))
          }
          disabled={!canNext}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
