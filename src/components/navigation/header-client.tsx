"use client";

import { ChevronDown, Heart, Menu, MessageCircle, Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { desktopNavItems } from "@/components/navigation/nav-items";

type HeaderClientProps = {
  displayName?: string;
};

export function HeaderClient({ displayName }: HeaderClientProps) {
  const pathname = usePathname();
  const mediumDesktopNavItems = desktopNavItems.slice(0, 5);
  const secondaryDesktopNavItems = desktopNavItems.slice(5);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:gap-3">
      <nav className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex xl:gap-1" aria-label="Primary navigation">
        {mediumDesktopNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary xl:px-3",
                active && "bg-brand-light text-brand-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        {secondaryDesktopNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "hidden shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary xl:inline-flex",
                active && "bg-brand-light text-brand-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 px-2.5 text-text-secondary hover:text-text-primary xl:hidden"
              aria-label="Open more navigation"
            >
              More
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" aria-label="More navigation">
            {secondaryDesktopNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="hidden shrink-0 items-center gap-1 whitespace-nowrap lg:flex xl:gap-1.5" aria-label="Header actions">
        <Button variant="ghost" size="sm" className="shrink-0 px-2.5 xl:px-3" asChild>
          <Link href="/messages">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Messages
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0 px-2.5 xl:px-3" asChild>
          <Link href="/saved">
            <Heart className="h-4 w-4" aria-hidden="true" />
            Saved
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="shrink-0 px-2.5 xl:px-3" asChild>
          <Link href={displayName ? "/account" : "/auth/log-in"}>
            <UserCircle className="h-4 w-4" aria-hidden="true" />
            {displayName ? "Account" : "Log In"}
          </Link>
        </Button>
        <Button size="sm" className="shrink-0 px-3" asChild>
          <Link href="/post">Post Listing</Link>
        </Button>
      </div>
      <div className="flex shrink-0 items-center gap-1 lg:hidden">
        <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
          <Link href="/search" aria-label="Search GuzoMarket">
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10" aria-label="Open navigation">
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
              <Link className="rounded-md px-3 py-3 text-base font-medium text-text-primary hover:bg-surface-muted" href="/post">
                Post Listing
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
