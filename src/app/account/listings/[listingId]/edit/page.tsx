import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { updateListingAction } from "@/features/account/actions";
import { PostListingForm } from "@/features/listings/post-listing-form";
import { requireActiveUser } from "@/server/auth/session";
import { getOwnedListingEditDraft, getPostListingOptions, issueListingSubmissionToken } from "@/server/marketplace/listing-create";

export const metadata: Metadata = {
  title: "Edit Listing | GuzoMarket",
  robots: { index: false, follow: false },
};

type EditListingPageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { listingId } = await params;
  const user = await requireActiveUser(`/account/listings/${listingId}/edit`);
  const [options, draft] = await Promise.all([
    getPostListingOptions(),
    getOwnedListingEditDraft(user.id, listingId),
  ]);
  const submissionToken = issueListingSubmissionToken();
  const action = updateListingAction.bind(null, listingId);

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="grid max-w-[1040px] gap-5 py-6 lg:py-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/account", label: "Account" },
            { href: "/account/listings", label: "My Listings" },
            { label: "Edit Listing" },
          ]}
        />
        <PostListingForm
          {...options}
          draft={draft}
          submissionToken={submissionToken}
          mode="edit"
          title="Edit listing"
          submitLabel="Save listing"
          pendingSubmitLabel="Saving..."
          actionOverride={action}
        />
      </Container>
    </div>
  );
}
