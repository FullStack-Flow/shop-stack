import ShopTransactionsTemplate from "@/components/templates/vendor/shop-transactions-template";
import { mockTransactions } from "@/data/transactions";
import { Transaction } from "@/types/transaction";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(vendor)/shop/$slug/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);

  return (
    <>
      <ShopTransactionsTemplate transactions={transactions} />
    </>
  );
}
