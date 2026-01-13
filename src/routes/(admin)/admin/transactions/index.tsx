import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import AdminTransactionsTemplate from '@/components/templates/admin/admin-transactions-template';
import { mockTransactions } from '@/data/transactions';
import type { Transaction } from '@/types/transaction';

export const Route = createFileRoute('/(admin)/admin/transactions/')({
  component: AdminTransactionsPage,
});

function AdminTransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const handleViewTransaction = (transactionId: string) => {
    console.log('View transaction:', transactionId);
  };

  const handleRefundTransaction = (transactionId: string) => {
    console.log('Refund transaction:', transactionId);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log('Delete transaction:', transactionId);
  };

  return (
    <AdminTransactionsTemplate
      transactions={transactions}
      onViewTransaction={handleViewTransaction}
      onRefundTransaction={handleRefundTransaction}
      onDeleteTransaction={handleDeleteTransaction}
    />
  );
}
