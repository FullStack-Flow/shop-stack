import { Link, useRouter } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth-client";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() || "U";
  return "U";
}

export default function UserMenu({ user }: { user: User }) {
  const initials = getInitials(user?.name, user?.email);
  const router = useRouter();
  const isVendor = user?.role === "vendor";

  const handleSignOut = async () => {
    const currentPath = window.location.pathname + window.location.search;
    await signOut();
    router.navigate({
      to: "/auth/sign-in",
      search: { redirectTo: currentPath },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          type="button"
          aria-label="User menu"
          className="rounded-full"
        >
          <Avatar className="size-8 border">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || user?.email || "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user?.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isVendor && (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard"
                className="w-full cursor-pointer font-medium text-primary"
              >
                <Store className="mr-2 h-4 w-4" />
                Vendor Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="w-full cursor-pointer font-medium">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="w-full cursor-pointer font-medium">
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist" className="w-full cursor-pointer font-medium">
            My Wishlists
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/checkout" className="w-full cursor-pointer font-medium">
            Checkout
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer font-medium text-destructive focus:text-destructive"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
