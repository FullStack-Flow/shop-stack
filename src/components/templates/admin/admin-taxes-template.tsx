import { Plus } from "lucide-react";
import { useState } from "react";
import { AddTaxDialog } from "@/components/containers/shared/taxes/add-tax-dialog";
import TaxHeader from "@/components/containers/shared/taxes/tax-header";
import { Button } from "@/components/ui/button";
import { ADMIN_TAX_PERMISSIONS } from "@/lib/config/tax-permissions";
import type { TaxRate } from "@/lib/db/schema/tax-schema";

interface AdminTaxesTemplateProps {
  taxes: TaxRate[];
  onAddTax: (data: Omit<TaxRate, "id" | "createdAt">) => void;
  onDeleteTax: (id: string) => void;
}

export default function AdminTaxesTemplate({
  taxes,
  onAddTax,
  onDeleteTax,
}: AdminTaxesTemplateProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <TaxHeader>
        <AddTaxDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={onAddTax}
        />
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Tax
        </Button>
      </TaxHeader>

      <TaxesTable
        taxes={taxes}
        permissions={ADMIN_TAX_PERMISSIONS}
        onDeleteTax={onDeleteTax}
      />
    </div>
  );
}
