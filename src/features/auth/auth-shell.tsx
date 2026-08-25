import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <Container className="grid min-h-screen content-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <Link href="/" className="font-display text-2xl font-bold text-brand-primary">
          GuzoMarket
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm leading-6 text-text-secondary">{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </Container>
  );
}
