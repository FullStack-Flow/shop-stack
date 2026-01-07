import PageHeader from "@/components/base/common/page-header";

interface TransactionsHeaderProps {
  className?: string;
}

export default function TransactionsHeader({
  className,
}: TransactionsHeaderProps) {
  return (
    <PageHeader
      title="Transactions"
      description="View and manage your shop transactions"
      className={className}
    />
  );
}