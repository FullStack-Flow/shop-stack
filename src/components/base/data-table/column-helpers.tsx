import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

function IndeterminateCheckbox(
  props: React.ComponentProps<typeof Checkbox> & { indeterminate?: boolean }
) {
  const { indeterminate, ...rest } = props;
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      const input = ref.current.querySelector('input');
      if (input) {
        input.indeterminate = !!indeterminate;
      }
    }
  }, [indeterminate]);
  return <Checkbox ref={ref} {...rest} />;
}

/** Create a checkbox selection column. */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        aria-label="Select all"
        indeterminate={table.getIsSomePageRowsSelected()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  };
}

/** Utility to format currency values */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

/**
 * Helper to build common columns with minimal boilerplate.
 */
export function createColumns<TData>(
  defs: ColumnDef<TData, any>[],
  options?: { includeSelection?: boolean }
) {
  const cols = [...defs];
  if (options?.includeSelection) {
    cols.unshift(createSelectionColumn<TData>());
  }
  return cols;
}
