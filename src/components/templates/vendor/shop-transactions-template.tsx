import TransactionsHeader from "@/components/containers/vendors/transactions/transactions-header";
import TransactionsTable from "@/components/containers/vendors/transactions/transactions-table";
import { Transaction } from "@/types/transaction";

interface ShopTransactionsTemplateProps {
  transactions: Transaction[];
}

export default function ShopTransactionsTemplate({
  transactions,
}: ShopTransactionsTemplateProps) {
  return (
    <div className="space-y-6">
      <TransactionsHeader />
      <TransactionsTable transactions={transactions} />
    </div>
  );
}