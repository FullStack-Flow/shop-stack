import {
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Home,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DefaultErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  const errorMessage =
    Error instanceof Error ? error.message : JSON.stringify(error);
  const stackTrace = error instanceof Error ? error.stack : null;

  console.error("DefaultErrorBoundary caught error:", error);

  return (
    <div className="@container flex min-h-[50vh] min-w-0 flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-xl backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-2 pb-2 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive ring-1 ring-destructive/20">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="font-bold text-2xl">
            Something went wrong
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected error. Please try again or return to
            the previous page.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-between font-normal text-muted-foreground text-xs hover:bg-muted/50"
                >
                  <span>Error Details</span>
                  {isOpen ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-md bg-muted/50 p-3 font-mono text-xs">
                  <p className="wrap-break-word font-semibold text-destructive">
                    {errorMessage}
                  </p>
                  {stackTrace && (
                    <ScrollArea className="mt-2 h-37.5 w-full rounded border bg-background/50 p-2 text-muted-foreground">
                      <pre className="whitespace-pre-wrap break-all text-[10px] leading-tight opacity-70">
                        {stackTrace}
                      </pre>
                    </ScrollArea>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 @xl:flex-row">
          <Button
            onClick={() => router.invalidate()}
            className="w-full @xl:w-auto"
          >
            <RefreshCcw className="size-4" />
            Try Again
          </Button>
          {isRoot ? (
            <Button
              variant="outline"
              asChild
              className="w-full gap-2 @xl:flex-1"
            >
              <Link to="/">
                <Home className="size-4" />
                Home
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full gap-2 @xl:flex-1"
            >
              <RotateCcw className="size-4" />
              Go Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
