import PageHeader from "@/components/base/common/page-header";

export interface TransactionHeaderProps {
  role?: "admin" | "vendor";
  children?: React.ReactNode;
  className?: string;
}

export default function TransactionHeader({
  role = "vendor",
  children,
  className,
}: TransactionHeaderProps) {
  return (
    <PageHeader
      title="Transactions"
      description={
        role === "admin"
          ? "View and manage platform-wide transactions"
          : "View and manage your shop transactions"
      }
      className={className}
    >
      {children}
    </PageHeader>
  );
}
