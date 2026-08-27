import Link from "next/link";

import { Container } from "@/components/layout/container";
import { HeaderClient } from "@/components/navigation/header-client";
import { getCurrentUser } from "@/server/auth/session";

export async function GlobalHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-surface/96 shadow-sm backdrop-blur">
      <Container className="flex min-h-14 items-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-extrabold text-navy sm:text-2xl"
          aria-label="GuzoMarket home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-sm font-black text-text-inverse sm:h-9 sm:w-9 sm:text-base">
            G
          </span>
          <span className="hidden sm:inline lg:hidden xl:inline">GuzoMarket</span>
        </Link>
        <HeaderClient displayName={user?.displayName} />
      </Container>
    </header>
  );
}
