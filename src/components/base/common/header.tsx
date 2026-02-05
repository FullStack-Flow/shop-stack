import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag } from "lucide-react";
import Navbar from "@/components/base/common/navbar";
import CartSheet from "@/components/containers/store/cart/cart-sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/store/use-cart";
import { useSession } from "@/lib/auth/auth-client";
import { useCartStore } from "@/lib/store/cart-store";
import { ModeToggle } from "../provider/mode-toggle";
import { MobileMenu } from "./mobile-menu";
import UserMenu from "./user-menu";

const navigationItems = [
  { to: "/", label: "Home" },
  { to: "/product", label: "Products" },
  { to: "/category", label: "Categories" },
];

export default function Header() {
  const { data } = useSession();
  const user = data?.user;
  const { totalItems } = useCart();
  const { setIsOpen } = useCartStore();

  return (
    <header className="@container sticky top-0 z-40 w-full border-b border-dashed bg-background backdrop-blur supports-filter:bg-background/80">
      <div className="@container container mx-auto grid @6xl:grid-cols-3 grid-cols-2 items-center px-4 py-7">
        <Navbar items={navigationItems} />

        <div className="flex items-center justify-start @6xl:justify-center">
          <Link
            to="/"
            className="font-bold @6xl:text-4xl text-xl tracking-tight dark:text-white"
          >
            Shop
            <span className="text-4xl text-primary">.</span>
            Stack
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="@6xl:flex hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon-lg"
              type="button"
              aria-label="Open Cart"
              onClick={() => setIsOpen(true)}
              className="relative"
            >
              <ShoppingBag className="@7xl:size-6 size-5" />
              {totalItems > 0 && (
                <span className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
            <CartSheet />

            <ModeToggle />

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link to="/auth/sign-in">
                <Button variant="default" size="lg" type="button">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="flex @6xl:hidden">
            <MobileMenu
              navigationItems={navigationItems}
              trigger={
                <Button
                  variant="secondary"
                  size="icon-lg"
                  aria-label="Open menu"
                  className="rounded-xl"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
