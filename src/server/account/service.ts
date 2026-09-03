import { revalidatePath } from "next/cache";

import { ApplicationError } from "@/lib/errors/application-error";
import { formatDate } from "@/lib/formatting/date";
import { prisma } from "@/server/db/client";
import {
  CategoryDomainType,
  ListingStatus,
  type Prisma,
} from "@/server/db/generated/prisma/client";
import { formatListingPrice } from "@/server/marketplace/listing-detail";
import { formatPublicLocationLabel } from "@/server/marketplace/locations";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const displayNameMaxLength = 80;
const usernamePattern = /^[a-z0-9][a-z0-9_-]{2,29}$/;
const bioMaxLength = 500;
const publicLocationMaxLength = 80;

export type AccountProfileDTO = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  publicLocationText: string;
  isPublic: boolean;
  publicHref: string;
};

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type AccountListingTab = "active" | "pending" | "drafts" | "completed" | "expired" | "archived";
export type OwnerListingAction = "view" | "edit" | "continue-draft" | "mark-sold" | "mark-rented" | "mark-filled" | "archive" | "delete";

export type AccountListingDTO = {
  id: string;
  title: string;
  priceLabel: string;
  categoryLabel: string;
  categoryGroupLabel: string;
  locationLabel: string;
  status: ListingStatus;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "error" | "outline";
  updatedLabel: string;
  publishedLabel: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  publicHref: string;
  editHref: string;
  draftHref: string;
  actions: OwnerListingAction[];
};

export type AccountListingsDTO = {
  selectedTab: AccountListingTab;
  tabs: Array<{ key: AccountListingTab; label: string; count: number }>;
  listings: AccountListingDTO[];
};

export async function getAccountProfile(userId: string): Promise<AccountProfileDTO> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      displayName: true,
      username: true,
      bio: true,
      avatarUrl: true,
      publicLocationText: true,
      isPublic: true,
    },
  });

  if (!profile) {
    throw new ApplicationError("NOT_FOUND", { message: "Profile not found." });
  }

  return {
    displayName: profile.displayName,
    username: profile.username ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    publicLocationText: profile.publicLocationText ?? "",
    isPublic: profile.isPublic,
    publicHref: `/users/${profile.username ?? userId}`,
  };
}

export async function updateAccountProfileFromFormData(
  userId: string,
  formData: FormData,
): Promise<ProfileActionState> {
  const input = {
    displayName: stringValue(formData.get("displayName")),
    username: stringValue(formData.get("username")),
    bio: stringValue(formData.get("bio")),
    avatarUrl: stringValue(formData.get("avatarUrl")),
    publicLocationText: stringValue(formData.get("publicLocationText")),
    isPublic: formData.get("isPublic") === "on",
  };
  const fieldErrors: Record<string, string[]> = {};
  const displayName = normalizeText(input.displayName);
  const username = normalizeText(input.username).toLowerCase();
  const bio = normalizeMultilineText(input.bio);
  const avatarUrl = normalizeText(input.avatarUrl);
  const publicLocationText = normalizeText(input.publicLocationText);

  if (displayName.length < 2) {
    fieldErrors.displayName = ["Enter a display name."];
  } else if (displayName.length > displayNameMaxLength) {
    fieldErrors.displayName = [`Keep display name under ${displayNameMaxLength} characters.`];
  }

  if (username && !usernamePattern.test(username)) {
    fieldErrors.username = ["Use 3-30 lowercase letters, numbers, underscores, or hyphens."];
  }

  if (bio.length > bioMaxLength) {
    fieldErrors.bio = [`Keep bio under ${bioMaxLength} characters.`];
  }

  if (publicLocationText.length > publicLocationMaxLength) {
    fieldErrors.publicLocationText = [`Keep public location under ${publicLocationMaxLength} characters.`];
  }

  if (avatarUrl && !isSafeRelativeOrHttpsUrl(avatarUrl)) {
    fieldErrors.avatarUrl = ["Use a valid HTTPS or site-relative image URL."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Review the highlighted profile fields.", fieldErrors };
  }

  const existingUsername = username
    ? await prisma.profile.findFirst({
        where: { username, userId: { not: userId } },
        select: { id: true },
      })
    : null;

  if (existingUsername) {
    return {
      status: "error",
      message: "Review the highlighted profile fields.",
      fieldErrors: { username: ["That username is already taken."] },
    };
  }

  await prisma.profile.update({
    where: { userId },
    data: {
      displayName,
      username: username || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      publicLocationText: publicLocationText || null,
      isPublic: input.isPublic,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
  revalidatePath(`/users/${username || userId}`);
  return { status: "success", message: "Profile saved." };
}

export async function getAccountListings(userId: string, selectedTab: AccountListingTab): Promise<AccountListingsDTO> {
  const [counts, listings] = await Promise.all([
    Promise.all(accountListingTabs.map((tab) => prisma.listing.count({ where: tabWhere(userId, tab.key) }))),
    prisma.listing.findMany({
      where: tabWhere(userId, selectedTab),
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: 50,
      select: ownerListingSelect,
    }),
  ]);

  return {
    selectedTab,
    tabs: accountListingTabs.map((tab, index) => ({ ...tab, count: counts[index] ?? 0 })),
    listings: listings.map(toOwnerListingDTO),
  };
}

export async function transitionOwnedListing(
  ownerUserId: string,
  listingId: string,
  action: Exclude<OwnerListingAction, "view" | "edit" | "continue-draft">,
  now = new Date(),
) {
  if (!uuidPattern.test(listingId)) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid listing id." });
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerUserId, deletedAt: null },
    select: {
      id: true,
      status: true,
      slug: true,
      category: { select: { domainType: true, slug: true, parent: { select: { slug: true } } } },
    },
  });

  if (!listing) {
    throw new ApplicationError("NOT_FOUND", { message: "Listing not found." });
  }

  const next = nextLifecycleState(listing, action, now);
  if (!next) {
    throw new ApplicationError("BAD_REQUEST", { message: "This listing action is not allowed." });
  }

  const update = await prisma.listing.updateMany({
    where: { id: listing.id, ownerUserId, status: listing.status, deletedAt: null },
    data: next,
  });

  if (update.count !== 1) {
    throw new ApplicationError("CONFLICT", { message: "Listing changed before the action completed." });
  }

  revalidatePath("/account/listings");
  revalidatePath(`/account/listings/${listing.id}/edit`);
  revalidatePath(`/listings/${listing.slug}-${listing.id}`);
}

export function normalizeAccountListingTab(value: string | string[] | undefined): AccountListingTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return accountListingTabs.some((item) => item.key === tab) ? (tab as AccountListingTab) : "active";
}

export function getAllowedLifecycleActions(listing: {
  status: ListingStatus;
  category: { domainType: CategoryDomainType; slug: string; parent: { slug: string } | null };
}): OwnerListingAction[] {
  const actions: OwnerListingAction[] = [];

  if (listing.status === ListingStatus.DRAFT) {
    return ["continue-draft", "delete"];
  }

  const viewableStatuses: ListingStatus[] = [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED, ListingStatus.EXPIRED, ListingStatus.ARCHIVED];
  const editableStatuses: ListingStatus[] = [ListingStatus.ACTIVE, ListingStatus.PENDING_REVIEW];
  const archivableStatuses: ListingStatus[] = [ListingStatus.ACTIVE, ListingStatus.PENDING_REVIEW, ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED, ListingStatus.EXPIRED];
  const deletableStatuses: ListingStatus[] = [ListingStatus.DRAFT, ListingStatus.ARCHIVED];

  if (viewableStatuses.includes(listing.status)) {
    actions.push("view");
  }

  if (editableStatuses.includes(listing.status)) {
    actions.push("edit");
  }

  if (listing.status === ListingStatus.ACTIVE) {
    const completion = completionActionForCategory(listing.category);
    if (completion) {
      actions.push(completion);
    }
  }

  if (archivableStatuses.includes(listing.status)) {
    actions.push("archive");
  }

  if (deletableStatuses.includes(listing.status)) {
    actions.push("delete");
  }

  return actions;
}

function nextLifecycleState(
  listing: {
    status: ListingStatus;
    category: { domainType: CategoryDomainType; slug: string; parent: { slug: string } | null };
  },
  action: Exclude<OwnerListingAction, "view" | "edit" | "continue-draft">,
  now: Date,
): Prisma.ListingUpdateManyMutationInput | null {
  const archivableStatuses: ListingStatus[] = [ListingStatus.ACTIVE, ListingStatus.PENDING_REVIEW, ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED, ListingStatus.EXPIRED];
  const deletableStatuses: ListingStatus[] = [ListingStatus.DRAFT, ListingStatus.ARCHIVED];

  if (action === "archive" && archivableStatuses.includes(listing.status)) {
    return { status: ListingStatus.ARCHIVED, archivedAt: now };
  }

  if (action === "delete" && deletableStatuses.includes(listing.status)) {
    return { status: ListingStatus.REMOVED, deletedAt: now };
  }

  if (listing.status !== ListingStatus.ACTIVE) {
    return null;
  }

  if (action === completionActionForCategory(listing.category)) {
    if (action === "mark-rented") {
      return { status: ListingStatus.RENTED, soldAt: now };
    }
    if (action === "mark-filled") {
      return { status: ListingStatus.FILLED, soldAt: now };
    }
    return { status: ListingStatus.SOLD, soldAt: now };
  }

  return null;
}

function completionActionForCategory(category: { domainType: CategoryDomainType; slug: string; parent: { slug: string } | null }) {
  if (category.domainType === CategoryDomainType.JOB || category.parent?.slug === "jobs" || category.slug === "jobs") {
    return "mark-filled" as const;
  }
  if (category.parent?.slug === "housing" || category.slug === "housing") {
    return "mark-rented" as const;
  }
  return "mark-sold" as const;
}

function tabWhere(userId: string, tab: AccountListingTab): Prisma.ListingWhereInput {
  const base = { ownerUserId: userId } satisfies Prisma.ListingWhereInput;
  if (tab === "active") {
    return { ...base, status: ListingStatus.ACTIVE, deletedAt: null };
  }
  if (tab === "pending") {
    return { ...base, status: { in: [ListingStatus.PENDING_REVIEW, ListingStatus.REJECTED, ListingStatus.SUSPENDED] }, deletedAt: null };
  }
  if (tab === "drafts") {
    return { ...base, status: ListingStatus.DRAFT, deletedAt: null };
  }
  if (tab === "completed") {
    return { ...base, status: { in: [ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED] }, deletedAt: null };
  }
  if (tab === "expired") {
    return { ...base, status: ListingStatus.EXPIRED, deletedAt: null };
  }
  return { ...base, OR: [{ status: ListingStatus.ARCHIVED }, { deletedAt: { not: null } }] };
}

function toOwnerListingDTO(listing: Prisma.ListingGetPayload<{ select: typeof ownerListingSelect }>): AccountListingDTO {
  return {
    id: listing.id,
    title: listing.title,
    priceLabel: formatListingPrice(listing.priceAmount, listing.priceCurrency, listing.priceType),
    categoryLabel: listing.category.name,
    categoryGroupLabel: listing.category.parent?.name ?? "Marketplace",
    locationLabel: listing.publicLocation ? formatPublicLocationLabel(listing.publicLocation) : "No public location",
    status: listing.status,
    statusLabel: statusLabel(listing.status),
    statusTone: statusTone(listing.status),
    updatedLabel: `Updated ${formatDate(listing.updatedAt)}`,
    publishedLabel: listing.publishedAt ? `Published ${formatDate(listing.publishedAt)}` : null,
    imageSrc: listing.images[0]?.publicUrl ?? null,
    imageAlt: listing.images[0]?.altText ?? listing.title,
    publicHref: `/listings/${listing.slug}-${listing.id}`,
    editHref: `/account/listings/${listing.id}/edit`,
    draftHref: `/post?draftId=${listing.id}`,
    actions: getAllowedLifecycleActions(listing),
  };
}

function statusLabel(status: ListingStatus) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status: ListingStatus): AccountListingDTO["statusTone"] {
  if (status === ListingStatus.ACTIVE) {
    return "success";
  }
  const warningStatuses: ListingStatus[] = [ListingStatus.PENDING_REVIEW, ListingStatus.DRAFT, ListingStatus.EXPIRED];
  const errorStatuses: ListingStatus[] = [ListingStatus.REJECTED, ListingStatus.REMOVED, ListingStatus.SUSPENDED];
  const completedStatuses: ListingStatus[] = [ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED];

  if (warningStatuses.includes(status)) {
    return "warning";
  }
  if (errorStatuses.includes(status)) {
    return "error";
  }
  if (completedStatuses.includes(status)) {
    return "default";
  }
  return "outline";
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMultilineText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function isSafeRelativeOrHttpsUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export const accountListingTabs: Array<{ key: AccountListingTab; label: string }> = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "drafts", label: "Drafts" },
  { key: "completed", label: "Completed" },
  { key: "expired", label: "Expired" },
  { key: "archived", label: "Archived" },
];

const ownerListingSelect = {
  id: true,
  title: true,
  slug: true,
  priceAmount: true,
  priceCurrency: true,
  priceType: true,
  status: true,
  updatedAt: true,
  publishedAt: true,
  category: { select: { name: true, slug: true, domainType: true, parent: { select: { name: true, slug: true } } } },
  publicLocation: {
    select: {
      name: true,
      type: true,
      regionCode: true,
      parent: { select: { name: true, type: true, regionCode: true, parent: { select: { name: true, type: true, regionCode: true } } } },
    },
  },
  images: {
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: { publicUrl: true, altText: true },
  },
} satisfies Prisma.ListingSelect;
