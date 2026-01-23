import { Link, useNavigate } from "@tanstack/react-router";
import VendorSignUpForm from "@/components/containers/auth/vendor-signup-form";

export default function VendorSignUpPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl">Become a Vendor</h1>
        <p className="text-muted-foreground text-sm">
          Create your vendor account and start selling on our platform.
        </p>
      </div>
      <div className="mt-6">
        <VendorSignUpForm onSuccess={() => navigate({ to: "/" })} />
      </div>
      <div className="mt-6 space-y-2 text-center">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="underline">
            Sign in
          </Link>
        </p>
        <p className="text-muted-foreground text-sm">
          Want to shop instead?{" "}
          <Link to="/auth/sign-up" className="underline">
            Create a customer account
          </Link>
        </p>
      </div>
    </div>
  );
}
