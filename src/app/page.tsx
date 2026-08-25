import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/feedback/alert";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { PageSection } from "@/components/layout/page-section";
import { SectionHeader } from "@/components/layout/section-header";
import { CategoryShortcuts } from "@/components/marketplace/category-shortcuts";
import { LocationSelectorShell } from "@/components/marketplace/location-selector-shell";
import { SearchField } from "@/components/marketplace/search-field";

export default function Home() {
  return (
    <PageSection>
      <Container className="grid gap-8">
        <SectionHeader
          eyebrow="GuzoMarket"
          title="Buy. Sell. Connect."
          description="Global shell and shared design primitives are ready for the next marketplace pages."
        />
        <SearchField action="/search" />
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <CategoryShortcuts />
          <LocationSelectorShell />
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Foundation Preview</CardTitle>
              <Badge>Stage 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            <p className="text-sm leading-6 text-text-secondary">
              Headers, bottom navigation, footer, forms, state components, search primitives,
              location shell, and listing-card foundations are in place. Real homepage data
              behavior remains intentionally deferred to Stage 7.
            </p>
            <div>
              <Button type="button">GuzoMarket Primary</Button>
            </div>
          </CardContent>
        </Card>
        <Alert title="Stage boundary">
          This page demonstrates shared primitives only. Listings, search data, favorites, and
          homepage sections are not implemented in this stage.
        </Alert>
        <EmptyState
          title="No listing data loaded yet"
          description="The reusable empty, loading, and error patterns are ready for upcoming marketplace stages."
        />
      </Container>
    </PageSection>
  );
}
