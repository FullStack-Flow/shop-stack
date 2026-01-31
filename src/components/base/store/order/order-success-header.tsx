import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessHeader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="relative mb-6">
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle className="h-16 w-16 text-primary" strokeWidth={2.5} />
        </div>
      </div>
      <h1 className="mb-4 font-bold text-3xl">Thanks for your order!</h1>
      <Link to="/product">
        <Button variant="outline" size="lg" className="rounded-full">
          Continue shopping
        </Button>
      </Link>
    </div>
  );
}
