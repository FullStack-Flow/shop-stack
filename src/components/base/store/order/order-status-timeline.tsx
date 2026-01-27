import { Check, Circle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStage {
  id: string;
  label: string;
  date?: string;
  status: "completed" | "active" | "pending";
}

interface OrderStatusTimelineProps {
  stages: TimelineStage[];
}

export default function OrderStatusTimeline({
  stages,
}: OrderStatusTimelineProps) {
  return (
    <div className="relative w-full">
      {/* Connecting lines container */}
      <div className="absolute top-6 right-0 left-0 flex items-center px-6">
        {stages.map(
          (stage, index) =>
            index < stages.length - 1 && (
              <div
                key={`line-${stage.id}`}
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  stage.status === "completed" ? "bg-primary" : "bg-muted"
                )}
              />
            )
        )}
      </div>

      {/* Stages */}
      <div className="relative flex items-start justify-between">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-1 flex-col items-center">
            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background transition-colors",
                stage.status === "completed" &&
                  "border-primary bg-primary text-primary-foreground",
                stage.status === "active" && "border-primary text-primary",
                stage.status === "pending" &&
                  "border-muted text-muted-foreground"
              )}
            >
              {stage.status === "completed" ? (
                <Check className="h-6 w-6" />
              ) : stage.status === "active" ? (
                <Package className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </div>

            {/* Label */}
            <div className="mt-4 text-center">
              <p
                className={cn(
                  "font-medium text-sm",
                  stage.status === "pending" && "text-muted-foreground"
                )}
              >
                {stage.label}
              </p>
              {stage.date && (
                <p className="mt-1 text-muted-foreground text-xs">
                  {stage.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
