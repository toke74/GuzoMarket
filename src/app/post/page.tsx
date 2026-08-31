import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { PostListingForm } from "@/features/listings/post-listing-form";
import { requireActiveUser } from "@/server/auth/session";
import { getOrCreatePostListingDraft, getPostListingOptions, issueListingSubmissionToken } from "@/server/marketplace/listing-create";

export const metadata: Metadata = {
  title: "Post Listing | GuzoMarket",
  description: "Create a local GuzoMarket listing.",
  robots: { index: false, follow: false },
};

type PostListingPageProps = {
  searchParams: Promise<{ draftId?: string; new?: string }>;
};

export default async function PostListingPage({ searchParams }: PostListingPageProps) {
  const params = await searchParams;
  const user = await requireActiveUser("/post");
  const options = await getPostListingOptions();
  const draft = await getOrCreatePostListingDraft({
    ownerUserId: user.id,
    draftId: params.draftId,
    startNew: params.new === "1",
  });
  const submissionToken = issueListingSubmissionToken();

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="grid max-w-[1040px] gap-5 py-6 lg:py-8">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Post Listing" }]} />
        <PostListingForm {...options} draft={draft} submissionToken={submissionToken} />
      </Container>
    </div>
  );
}
