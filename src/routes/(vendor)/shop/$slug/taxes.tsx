import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ShopTaxesTemplate from "@/components/templates/vendor/shop-taxes-template";
import { mockTaxes } from "@/data/taxes";
import type { Taxes as Tax, TaxFormValues } from "@/types/taxes";

export const Route = createFileRoute("/(vendor)/shop/$slug/taxes")({
  component: TaxesPage,
});

function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes);

  const handleTaxSubmit = (data: TaxFormValues) => {
    const newTax: Tax = {
      id: String(taxes.length + 1),
      name: data.name,
      rate: data.rate,
      country: data.country,
      state: data.state,
      zip: data.zip,
      priority: data.priority,
    };

    setTaxes([...taxes, newTax]);
    console.log("Created tax:", newTax);
  };

  return <ShopTaxesTemplate taxes={taxes} onAddTax={handleTaxSubmit} />;
}
