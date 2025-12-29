import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "icon";
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "icon",
}: EmptyStateProps) {
  return (
    <Empty className={cn(className)}>
      {icon && <EmptyMedia variant={variant}>{icon}</EmptyMedia>}
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
        {action && <EmptyContent>{action}</EmptyContent>}
      </EmptyHeader>
    </Empty>
  );
}
