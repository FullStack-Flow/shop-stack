import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import AuthForm from "@/components/containers/auth/auth-form";

export default function SignInPage() {
  const navigate = useNavigate();
  const { redirectTo } = useSearch({ from: "/auth/sign-in" });

  const handleSuccess = () => {
    // Navigate to the redirect URL if provided, otherwise go to home
    if (redirectTo?.startsWith("/")) {
      navigate({ to: redirectTo });
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl">Sign in to your account</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back. Please enter your details.
        </p>
      </div>
      <div className="mt-6">
        <AuthForm
          mode="sign-in"
          includeSocial
          onSuccess={handleSuccess}
          redirectUrl={redirectTo || "/"}
        />
      </div>
      <p className="mt-4 text-center text-muted-foreground text-sm">
        Don't have an account?{" "}
        <Link to="/auth/sign-up" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
