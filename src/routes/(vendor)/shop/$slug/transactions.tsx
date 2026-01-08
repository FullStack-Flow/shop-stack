import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ShopTransactionsTemplate from "@/components/templates/vendor/shop-transactions-template";
import { mockTransactions } from "@/data/transactions";
import type { Transaction } from "@/types/transaction";

export const Route = createFileRoute("/(vendor)/shop/$slug/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const handleViewTransaction = (transactionId: string) => {
    console.log("View transaction:", transactionId);
  };

  const handleRefundTransaction = (transactionId: string) => {
    console.log("Refund transaction:", transactionId);
  };

  return (
    <ShopTransactionsTemplate
      transactions={transactions}
      onViewTransaction={handleViewTransaction}
      onRefundTransaction={handleRefundTransaction}
    />
  );
}
