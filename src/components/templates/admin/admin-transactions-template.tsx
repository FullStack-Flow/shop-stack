import TransactionHeader from "@/components/containers/shared/transactions/transaction-header";
import TransactionsTable from "@/components/containers/shared/transactions/transaction-table";
import { ADMIN_TRANSACTION_PERMISSIONS } from "@/lib/config/transaction-permissions";
import type { Transaction } from "@/types/transaction";

interface AdminTransactionsTemplateProps {
  transactions: Transaction[];
  onViewTransaction?: (transactionId: string) => void;
  onRefundTransaction?: (transactionId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

export default function AdminTransactionsTemplate({
  transactions,
  onViewTransaction,
  onRefundTransaction,
  onDeleteTransaction,
}: AdminTransactionsTemplateProps) {
  return (
    <div className="flex flex-col gap-6">
      <TransactionHeader role="admin" />

      <TransactionsTable
        transactions={transactions}
        permissions={ADMIN_TRANSACTION_PERMISSIONS}
        onViewTransaction={onViewTransaction}
        onRefundTransaction={onRefundTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />
    </div>
  );
}
