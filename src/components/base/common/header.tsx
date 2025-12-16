import Navbar from "@/components/base/common/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "../provider/mode-toggle";

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <header className="@container sticky top-0 z-40 w-full border-b border-dashed bg-background backdrop-blur supports-filter:bg-background/80">
      <div className="container mx-auto grid- @6xl:grid-cols-3 grid-cols-2 items-center px-4 py-7">
        <Navbar />

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
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="@7xl:size-6 size-5" />
              {/* {totalItems} */}
              <span className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground">
                {/* {totalItems} */}
                10
              </span>
            </Button>

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
