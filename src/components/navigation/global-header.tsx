import Link from "next/link";

import { Container } from "@/components/layout/container";
import { HeaderClient } from "@/components/navigation/header-client";
import { getCurrentUser } from "@/server/auth/session";

export async function GlobalHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold text-brand-primary" aria-label="GuzoMarket home">
          GuzoMarket
        </Link>
        <HeaderClient displayName={user?.displayName} />
      </Container>
    </header>
  );
}
