import Link from "next/link";

import { marketplaceShortcutItems } from "@/components/navigation/nav-items";

export function CategoryShortcuts() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {marketplaceShortcutItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm hover:border-brand-primary hover:bg-brand-light"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-text-primary">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
