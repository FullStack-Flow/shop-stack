import { ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "./navbar";

export interface MobileMenuProps {
  navigationItems: { to: string; label: string }[];
  trigger: ReactNode;
}

export function MobileMenu({ navigationItems, trigger }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="p-6">
        <Navbar items={navigationItems} className="flex flex-col gap-3" />
        <div className="mt-6 flex items-center gap-3">
          <SheetClose asChild>
            <Button variant="outline" size="icon" aria-label="Open cart">
              <ShoppingBag className="size-5" />
            </Button>
          </SheetClose>
          {/* {user ? (
            <UserMenu user={user} />
          ) : (
            <SheetClose asChild>
              <Link to="/auth/sign-in" className="w-full">
                <Button variant="default" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            </SheetClose>
          )} */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
