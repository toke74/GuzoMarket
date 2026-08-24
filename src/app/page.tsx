import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeader } from "@/components/layout/section-header";

export default function Home() {
  return (
    <PageSection className="min-h-screen">
      <Container className="grid min-h-[calc(100vh-8rem)] content-center gap-8">
        <SectionHeader
          eyebrow="GuzoMarket"
          title="Buy. Sell. Connect."
          description="Project foundation is ready."
        />
        <Card className="max-w-xl">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Foundation Preview</CardTitle>
              <Badge>Prompt 0</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <p className="text-sm leading-6 text-text-secondary">
              Core project structure, design tokens, environment validation, Prisma, and
              test tooling are in place. Marketplace features are intentionally deferred.
            </p>
            <div>
              <Button type="button">GuzoMarket Primary</Button>
            </div>
          </CardContent>
        </Card>
        <EmptyState
          title="No marketplace features yet"
          description="Listings, accounts, search, messaging, and admin workflows start in later prompts."
        />
      </Container>
    </PageSection>
  );
}
