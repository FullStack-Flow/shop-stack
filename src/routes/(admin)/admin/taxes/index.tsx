import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import AdminTaxesTemplate from '@/components/templates/admin/admin-taxes-template';

interface TaxFormValues {
  id: string;
  name: string;
  rate: number;
  country: string;
  state?: string;
  zip?: string;
  priority: number;
  createdAt: Date;
}

const mockTaxes: TaxFormValues[] = [
  {
    id: '1',
    name: 'US Standard Sales Tax',
    rate: 8.25,
    country: 'US',
    state: 'CA',
    zip: '',
    priority: 1,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'UK VAT',
    rate: 20,
    country: 'UK',
    state: '',
    zip: '',
    priority: 1,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Canada GST',
    rate: 5,
    country: 'CA',
    state: 'ON',
    zip: '',
    priority: 1,
    createdAt: new Date('2024-02-01'),
  },
];

export const Route = createFileRoute('/(admin)/admin/taxes/')({
  component: AdminTaxesPage,
});

function AdminTaxesPage() {
  const [taxes, setTaxes] = useState<TaxFormValues[]>(mockTaxes);

  const handleAddTax = (data: Omit<TaxFormValues, 'id' | 'createdAt'>) => {
    const newTax: TaxFormValues = {
      ...data,
      id: String(taxes.length + 1),
      createdAt: new Date(),
    };
    setTaxes([...taxes, newTax]);
  };

  const handleDeleteTax = (id: string) => {
    setTaxes(taxes.filter((tax) => tax.id !== id));
  };

  return (
    <AdminTaxesTemplate
      taxes={taxes}
      onAddTax={handleAddTax}
      onDeleteTax={handleDeleteTax}
    />
  );
}
