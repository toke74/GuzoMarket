"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { desktopNavItems } from "@/components/navigation/nav-items";

type HeaderClientProps = {
  displayName?: string;
};

export function HeaderClient({ displayName }: HeaderClientProps) {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
        {desktopNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary",
                active && "bg-brand-light text-brand-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/messages">Messages</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/saved">Saved</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={displayName ? "/account" : "/auth/log-in"}>
            {displayName ? "Account" : "Log In"}
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/post">Post Listing</Link>
        </Button>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/search" aria-label="Search GuzoMarket">
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>GuzoMarket</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 grid gap-2" aria-label="Mobile menu">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-base font-medium text-text-primary hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link className="rounded-md px-3 py-3 text-base font-medium text-text-primary hover:bg-surface-muted" href="/messages">
                Messages
              </Link>
              <Link className="rounded-md px-3 py-3 text-base font-medium text-text-primary hover:bg-surface-muted" href="/saved">
                Saved
              </Link>
              <Link className="rounded-md px-3 py-3 text-base font-medium text-text-primary hover:bg-surface-muted" href={displayName ? "/account" : "/auth/log-in"}>
                {displayName ? "Account" : "Log In"}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
