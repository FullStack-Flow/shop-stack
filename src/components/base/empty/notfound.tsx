import { SearchX } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface NotFoundProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export default function NotFound({
  title = "No results found",
  description = "We couldn't find what you were looking for. Try adjusting your search or filters.",
  icon,
  className,
  children,
}: NotFoundProps) {
  return (
    <Empty className={cn("py-20", className)}>
      <EmptyHeader>
        <EmptyMedia>
          {icon || <SearchX className="size-10 text-muted-foreground" />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  );
}
