import { type ErrorComponentProps, Link } from "@tanstack/react-router";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DefaultErrorComponent } from "./default-error-component";

export function AdminAccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/40 shadow-xl backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center gap-2 pb-2 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive ring-1 ring-destructive/20">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="font-bold text-2xl text-destructive">
            Access Denied
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            You do not have permission to access the admin area.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <p>This section is restricted to administrators only.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full gap-2 sm:flex-1"
            size="lg"
          >
            <RotateCcw className="size-4" />
            Go Back
          </Button>
          <Button asChild className="w-full gap-2 sm:flex-1" size="lg">
            <Link to="/">
              <Home className="size-4" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminErrorComponent({
  error,
  reset,
  info,
}: ErrorComponentProps) {
  if (error.message.includes("Admin access required")) {
    return <AdminAccessDenied />;
  }

  return <DefaultErrorComponent error={error} reset={reset} info={info} />;
}
