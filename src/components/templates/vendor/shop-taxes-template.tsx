import TaxHeader from '@/components/containers/shared/taxes/tax-header';
import TaxesTable from '@/components/containers/shared/taxes/tax-table';
import { VENDOR_TAX_PERMISSIONS } from '@/lib/config/tax-permissions';
import type { Taxes as Tax } from '@/types/taxes';

interface ShopTaxesTemplateProps {
  taxes: Tax[];
  onAddTax?: (data: any) => void;
  onEditTax?: (taxId: string) => void;
  onDeleteTax?: (taxId: string) => void;
}

export default function ShopTaxesTemplate({
  taxes,
  onAddTax,
  onEditTax,
  onDeleteTax,
}: ShopTaxesTemplateProps) {
  return (
    <div className="space-y-6">
      <TaxHeader role="vendor" onAddTax={onAddTax} showAddButton={!!onAddTax} />
      <TaxesTable
        taxes={taxes}
        permissions={VENDOR_TAX_PERMISSIONS}
        onEditTax={onEditTax}
        onDeleteTax={onDeleteTax}
      />
    </div>
  );
}
