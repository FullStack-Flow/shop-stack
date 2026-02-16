import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@/components/base/data-table/types";
import TaxHeader from "@/components/containers/shared/taxes/tax-header";
import { TaxTable } from "@/components/containers/shared/taxes/tax-table";
import type { TaxMutationState } from "@/components/containers/shared/taxes/tax-table-columns";
import type { TaxRateItem } from "@/types/taxes";

interface AdminTaxesTemplateProps {
  fetcher: (
    params: DataTableFetchParams,
  ) => Promise<DataTableFetchResult<TaxRateItem>>;
  onDeleteTax?: (taxRate: TaxRateItem) => void;
  onEditTax?: (taxRate: TaxRateItem) => void;
  onToggleActive?: (taxRate: TaxRateItem) => void;
  mutationState?: TaxMutationState;
  isTaxMutating?: (id: string) => boolean;
}

export default function AdminTaxesTemplate({
  fetcher,
  onDeleteTax,
  onEditTax,
  onToggleActive,
  mutationState,
  isTaxMutating,
}: AdminTaxesTemplateProps) {
  return (
    <div className="flex flex-col gap-6">
      <TaxHeader role="admin" showAddButton={false} />

      <TaxTable
        fetcher={fetcher}
        onDelete={onDeleteTax}
        onEdit={onEditTax}
        onToggleActive={onToggleActive}
        mutationState={mutationState}
        isMutating={isTaxMutating}
        mode="admin"
      />
    </div>
  );
}
