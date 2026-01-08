import TransactionHeader from '@/components/containers/shared/transactions/transaction-header';
import TransactionsTable from '@/components/containers/shared/transactions/transaction-table';
import { VENDOR_TRANSACTION_PERMISSIONS } from '@/lib/config/transaction-permissions';
import type { Transaction } from '@/types/transaction';

interface ShopTransactionsTemplateProps {
  transactions: Transaction[];
  onViewTransaction?: (transactionId: string) => void;
  onRefundTransaction?: (transactionId: string) => void;
}

export default function ShopTransactionsTemplate({
  transactions,
  onViewTransaction,
  onRefundTransaction,
}: ShopTransactionsTemplateProps) {
  return (
    <div className="space-y-6">
      <TransactionHeader role="vendor" />
      <TransactionsTable
        transactions={transactions}
        permissions={VENDOR_TRANSACTION_PERMISSIONS}
        onViewTransaction={onViewTransaction}
        onRefundTransaction={onRefundTransaction}
      />
    </div>
  );
}
