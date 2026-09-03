import Link from "next/link";
import { Bell, Bookmark, Lock, LogOut, MessageSquare, Settings, Shield, Store, UserRound } from "lucide-react";

import { logOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type AccountShellProps = {
  active: "overview" | "profile" | "listings" | "security" | "privacy";
  children: React.ReactNode;
};

const accountNavGroups = [
  [
    { href: "/account/profile", label: "Profile", key: "profile", icon: UserRound, available: true },
    { href: "/account/listings", label: "My Listings", key: "listings", icon: Store, available: true },
  ],
  [
    { href: "/saved/listings", label: "Saved", key: "saved", icon: Bookmark, available: false },
    { href: "/messages", label: "Messages", key: "messages", icon: MessageSquare, available: false },
    { href: "/notifications", label: "Notifications", key: "notifications", icon: Bell, available: false },
  ],
  [
    { href: "/account/security", label: "Security", key: "security", icon: Shield, available: true },
    { href: "/account/privacy", label: "Privacy", key: "privacy", icon: Lock, available: true },
    { href: "/account/settings", label: "Settings", key: "settings", icon: Settings, available: false },
  ],
] as const;

const accountNavItems = accountNavGroups.flat();

export function AccountShell({ active, children }: AccountShellProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden rounded-lg border border-border bg-surface p-3 shadow-sm md:block">
        <p className="px-3 py-2 font-display text-lg font-bold text-navy">Account</p>
        <AccountNav active={active} />
      </aside>
      <div className="grid min-w-0 gap-4 md:hidden">
        <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
          <p className="px-2 pb-2 font-display text-lg font-bold text-navy">Account</p>
          <AccountNav active={active} compact />
        </div>
      </div>
      <main className="min-w-0">{children}</main>
    </div>
  );
}

export function AccountNav({ active, compact }: { active: AccountShellProps["active"]; compact?: boolean }) {
  return (
    <div className="grid gap-3">
      <nav aria-label="Account navigation" className="grid gap-3">
        {accountNavGroups.map((group, index) => (
          <ul key={index} className={cn("grid gap-1", compact ? "grid-cols-2 sm:grid-cols-3" : "", index > 0 ? "border-t border-border pt-3" : "")}>
            {group.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              const content = (
                <>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 truncate">{item.label}</span>
                  {!item.available ? <span className="sr-only"> unavailable</span> : null}
                </>
              );

              return (
                <li key={item.key}>
                  {item.available ? (
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors",
                        isActive ? "bg-brand-light text-brand-primary" : "text-text-primary hover:bg-surface-muted",
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-text-secondary opacity-70">
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
      </nav>
      <form action={logOutAction} className="border-t border-border pt-3">
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-text-primary transition-colors hover:bg-surface-muted"
        >
          <LogOut className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </form>
    </div>
  );
}

export { accountNavItems };
