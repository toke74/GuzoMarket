import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  type PostListingActionState,
  type PostListingAttributeDTO,
  type PostListingDraftDTO,
} from "@/features/listings/post-listing-types";
import { ApplicationError } from "@/lib/errors/application-error";
import { prisma } from "@/server/db/client";
import {
  AttributeDataType,
  CategoryDomainType,
  ContactPreference,
  ListingStatus,
  LocationPrecision,
  ModerationState,
  PriceType,
  type Prisma,
} from "@/server/db/generated/prisma/client";
import { formatPublicLocationLabel, validateActivePublicLocationId } from "@/server/marketplace/locations";

const TITLE_MIN_LENGTH = 8;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 5000;
const TEXT_ATTRIBUTE_MAX_LENGTH = 120;
const MAX_PRICE_CENTS = 1_000_000_000;
const MAX_MEDIA_COUNT = 8;
const MAX_MEDIA_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const listingPriceTypes = [
  PriceType.FIXED,
  PriceType.NEGOTIABLE,
  PriceType.FREE,
  PriceType.CONTACT,
  PriceType.PER_MONTH,
] as const;

const conditionValues = new Set(["new", "like_new", "good", "fair"]);
const consumedSubmissionTokens = new Map<string, number>();
const submissionTokenTtlMs = 60 * 60 * 1000;

type AttributeValidation = {
  min?: number;
  max?: number;
};

type AttributeDefinition = PostListingAttributeDTO;

type RawListingInput = {
  draftId: string;
  submissionToken: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  condition: string;
  publicLocationId: string;
  attributeValues: Record<string, FormDataEntryValue | FormDataEntryValue[]>;
  media: File[];
};

type ValidatedListingInput = {
  draftId: string;
  submissionToken: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  priceAmount: string | null;
  priceType: PriceType;
  condition: string | null;
  publicLocationId: string;
  locationPrecision: LocationPrecision;
  attributes: ValidatedAttributeValue[];
};

type ValidatedAttributeValue = {
  attributeDefinitionId: string;
  textValue?: string;
  integerValue?: number;
  decimalValue?: string;
  booleanValue?: boolean;
  dateValue?: Date;
  optionValue?: string;
  multiOptionJson?: string[];
};

type CreateListingResult =
  | { ok: true; href: string }
  | { ok: false; state: PostListingActionState };

type SaveDraftResult =
  | { ok: true; state: PostListingActionState; draft: PostListingDraftDTO }
  | { ok: false; state: PostListingActionState };

export async function getPostListingOptions() {
  const [categories, locations] = await Promise.all([
    prisma.category.findMany({
      where: { domainType: CategoryDomainType.LISTING, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        description: true,
        parent: { select: { name: true } },
        children: {
          where: { domainType: CategoryDomainType.LISTING, isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true },
        },
        attributeDefinitions: {
          orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
          select: categoryAttributeSelect,
        },
      },
    }),
    prisma.location.findMany({
      where: {
        isActive: true,
        marketplaceRegions: { some: { marketplaceRegion: { slug: "dmv", isActive: true } } },
      },
      orderBy: [{ name: "asc" }],
      select: publicLocationSelect,
    }),
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentName: category.parent?.name ?? null,
      children: category.children,
      attributes: category.attributeDefinitions.map(toAttributeDTO),
    })),
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      label: formatPublicLocationLabel(location),
    })),
    priceTypes: listingPriceTypes.map((value) => ({ value, label: getPriceTypeLabel(value) })),
    conditions: [
      { value: "new", label: "New" },
      { value: "like_new", label: "Like new" },
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair" },
    ],
    media: {
      maxCount: MAX_MEDIA_COUNT,
      maxSizeBytes: MAX_MEDIA_SIZE_BYTES,
      acceptedTypes: [...ALLOWED_MEDIA_TYPES],
    },
  };
}

export async function getOrCreatePostListingDraft({
  ownerUserId,
  draftId,
  startNew,
  now = new Date(),
}: {
  ownerUserId: string;
  draftId?: string;
  startNew?: boolean;
  now?: Date;
}) {
  if (draftId && !uuidPattern.test(draftId)) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid draft id." });
  }

  if (draftId) {
    const draft = await queryOwnedDraft(ownerUserId, draftId);
    if (!draft) {
      throw new ApplicationError("NOT_FOUND", { message: "Draft not found." });
    }
    return draft;
  }

  if (!startNew) {
    const latestDraft = await prisma.listing.findFirst({
      where: { ownerUserId, status: ListingStatus.DRAFT, deletedAt: null },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: draftSelect,
    });

    if (latestDraft) {
      return toDraftDTO(latestDraft);
    }
  }

  const category = await findDefaultDraftCategory();
  const listing = await prisma.listing.create({
    data: {
      ownerUserId,
      categoryId: category.id,
      title: "Untitled draft",
      slug: `draft-${randomUUID().slice(0, 8)}`,
      description: "Draft listing in progress.",
      priceType: PriceType.CONTACT,
      status: ListingStatus.DRAFT,
      moderationState: ModerationState.NOT_REVIEWED,
      locationPrecision: LocationPrecision.APPROXIMATE,
      contactPreference: ContactPreference.IN_APP_MESSAGE,
      isFeatured: false,
      createdAt: now,
    },
    select: draftSelect,
  });

  return toDraftDTO(listing);
}

export function issueListingSubmissionToken() {
  return randomUUID();
}

export function resetListingSubmissionTokensForTests() {
  consumedSubmissionTokens.clear();
}

export async function saveListingDraftFromFormData(
  ownerUserId: string,
  formData: FormData,
): Promise<SaveDraftResult> {
  const input = parseListingFormData(formData);
  const ownership = await validateOwnedDraft(ownerUserId, input.draftId);

  if (!ownership.ok) {
    return ownership;
  }

  const parsed = await validateListingInput(input, { mode: "draft" });
  if (!parsed.ok) {
    return parsed;
  }

  const draft = await persistDraft(ownership.draftId, parsed.data);
  return {
    ok: true,
    draft,
    state: {
      status: "success",
      message: "Draft saved.",
      draftId: draft.id,
      savedAt: new Date().toISOString(),
    },
  };
}

export async function publishListingDraftFromFormData(
  ownerUserId: string,
  formData: FormData,
  now = new Date(),
): Promise<CreateListingResult> {
  const input = parseListingFormData(formData);
  const ownership = await validateOwnedDraft(ownerUserId, input.draftId);

  if (!ownership.ok) {
    return ownership;
  }

  const parsed = await validateListingInput(input, { mode: "publish" });
  if (!parsed.ok) {
    return parsed;
  }

  const tokenResult = consumeSubmissionToken(ownerUserId, parsed.data.submissionToken, now);
  if (!tokenResult.ok) {
    return tokenResult;
  }

  try {
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    const activated = await prisma.listing.updateMany({
      where: {
        id: ownership.draftId,
        ownerUserId,
        status: ListingStatus.DRAFT,
        deletedAt: null,
      },
      data: {
        categoryId: parsed.data.categoryId,
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        priceAmount: parsed.data.priceAmount,
        priceCurrency: "USD",
        priceType: parsed.data.priceType,
        condition: parsed.data.condition,
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: parsed.data.publicLocationId,
        postalCode: null,
        latitude: null,
        longitude: null,
        locationPrecision: parsed.data.locationPrecision,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        availabilityText: null,
        isFeatured: false,
        featuredSource: null,
        publishedAt: now,
        expiresAt,
      },
    });

    if (activated.count !== 1) {
      return failureState("This draft was already published or is no longer available.");
    }

    const listing = await prisma.listing.update({
      where: { id: ownership.draftId },
      data: {
        attributeValues: {
          deleteMany: {},
          create: parsed.data.attributes.map(toNestedAttributeCreate),
        },
      },
      select: { id: true, slug: true },
    });

    const href = `/listings/${listing.slug}-${listing.id}`;
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(href);
    return { ok: true, href };
  } catch {
    return failureState("We could not publish this listing. Try again in a moment.");
  }
}

export async function createListingFromFormData(ownerUserId: string, formData: FormData, now = new Date()) {
  return publishListingDraftFromFormData(ownerUserId, formData, now);
}

export async function validateCreateListingInput(input: RawListingInput) {
  return validateListingInput(input, { mode: "publish" });
}

async function validateListingInput(
  input: RawListingInput,
  { mode }: { mode: "draft" | "publish" },
): Promise<{ ok: true; data: ValidatedListingInput } | { ok: false; state: PostListingActionState }> {
  const fieldErrors: Record<string, string[]> = {};
  const category = await loadSelectedCategory(input.categoryId);
  const requireComplete = mode === "publish";

  if (!category) {
    fieldErrors.categoryId = ["Choose a valid listing category."];
  } else if (category.children.length > 0) {
    fieldErrors.categoryId = ["Choose a specific subcategory."];
  }

  const title = normalizeText(input.title);
  if (requireComplete && title.length < TITLE_MIN_LENGTH) {
    fieldErrors.title = ["Enter a title with at least 8 characters."];
  } else if (title && title.length < TITLE_MIN_LENGTH) {
    fieldErrors.title = ["Enter a title with at least 8 characters before saving it."];
  } else if (title.length > TITLE_MAX_LENGTH) {
    fieldErrors.title = [`Keep the title under ${TITLE_MAX_LENGTH} characters.`];
  }

  const description = normalizeMultilineText(input.description);
  if (requireComplete && description.length < DESCRIPTION_MIN_LENGTH) {
    fieldErrors.description = ["Describe the item with at least 20 characters."];
  } else if (description && description.length < DESCRIPTION_MIN_LENGTH) {
    fieldErrors.description = ["Describe the item with at least 20 characters before saving it."];
  } else if (description.length > DESCRIPTION_MAX_LENGTH) {
    fieldErrors.description = [`Keep the description under ${DESCRIPTION_MAX_LENGTH} characters.`];
  }

  const priceType = parsePriceType(input.priceType);
  if (!priceType) {
    fieldErrors.priceType = ["Choose a valid price type."];
  }

  const priceAmount = priceType ? parsePrice(input.price, priceType, { required: requireComplete }) : { ok: false as const, message: "Enter a valid price." };
  if (!priceAmount.ok) {
    fieldErrors.price = [priceAmount.message];
  }

  const condition = normalizeText(input.condition).toLowerCase();
  const normalizedCondition = condition ? condition.replace(/-/g, "_") : "";
  if (normalizedCondition && !conditionValues.has(normalizedCondition)) {
    fieldErrors.condition = ["Choose a valid condition."];
  }

  let locationPrecision: LocationPrecision = LocationPrecision.APPROXIMATE;
  let publicLocationId = input.publicLocationId;
  if (!publicLocationId && requireComplete) {
    fieldErrors.publicLocationId = ["Choose a valid public location."];
  } else if (publicLocationId) {
    if (!uuidPattern.test(publicLocationId)) {
      fieldErrors.publicLocationId = ["Choose a valid public location."];
    } else {
      try {
        const location = await validateActivePublicLocationId(publicLocationId);
        locationPrecision =
          location.type === "NEIGHBORHOOD" ? LocationPrecision.NEIGHBORHOOD : LocationPrecision.CITY;
      } catch {
        fieldErrors.publicLocationId = ["Choose a valid public location."];
      }
    }
  }

  const mediaError = validateMedia(input.media);
  if (mediaError) {
    fieldErrors.media = [mediaError];
  }

  const attributes = category
    ? validateAttributes(category.attributes, input.attributeValues, fieldErrors, { requireComplete })
    : [];

  if (requireComplete && (!input.submissionToken || input.submissionToken.length > 80)) {
    fieldErrors.submissionToken = ["Refresh the page and try again."];
  }

  if (Object.keys(fieldErrors).length > 0 || !category || !priceType || !priceAmount.ok) {
    return {
      ok: false,
      state: { status: "error", message: "Review the highlighted fields.", fieldErrors, draftId: input.draftId },
    };
  }

  publicLocationId ||= "";

  return {
    ok: true,
    data: {
      draftId: input.draftId,
      submissionToken: input.submissionToken,
      categoryId: category.id,
      title: title || "Untitled draft",
      slug: title ? slugify(title) : `draft-${input.draftId.slice(0, 8)}`,
      description: description || "Draft listing in progress.",
      priceAmount: priceAmount.value,
      priceType,
      condition: normalizedCondition || null,
      publicLocationId,
      locationPrecision,
      attributes,
    },
  };
}

async function persistDraft(draftId: string, data: ValidatedListingInput) {
  const listing = await prisma.listing.update({
    where: { id: draftId },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      priceAmount: data.priceAmount,
      priceCurrency: "USD",
      priceType: data.priceType,
      condition: data.condition,
      status: ListingStatus.DRAFT,
      moderationState: ModerationState.NOT_REVIEWED,
      publicLocationId: data.publicLocationId || null,
      postalCode: null,
      latitude: null,
      longitude: null,
      locationPrecision: data.locationPrecision,
      contactPreference: ContactPreference.IN_APP_MESSAGE,
      availabilityText: null,
      isFeatured: false,
      featuredSource: null,
      publishedAt: null,
      attributeValues: {
        deleteMany: {},
        create: data.attributes.map(toNestedAttributeCreate),
      },
    },
    select: draftSelect,
  });

  return toDraftDTO(listing);
}

function parseListingFormData(formData: FormData): RawListingInput {
  const attributeValues: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  const media = formData.getAll("media").filter((item): item is File => typeof File !== "undefined" && item instanceof File && item.size > 0);

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("attr_")) {
      continue;
    }
    const attributeKey = key.replace(/^attr_/, "");
    const existing = attributeValues[attributeKey];
    if (existing) {
      attributeValues[attributeKey] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      attributeValues[attributeKey] = value;
    }
  }

  return {
    draftId: stringValue(formData.get("draftId")),
    submissionToken: stringValue(formData.get("submissionToken")),
    categoryId: stringValue(formData.get("categoryId")),
    title: stringValue(formData.get("title")),
    description: stringValue(formData.get("description")),
    price: stringValue(formData.get("price")),
    priceType: stringValue(formData.get("priceType")),
    condition: stringValue(formData.get("condition")),
    publicLocationId: stringValue(formData.get("publicLocationId")),
    attributeValues,
    media,
  };
}

async function validateOwnedDraft(ownerUserId: string, draftId: string) {
  if (!uuidPattern.test(draftId)) {
    return {
      ok: false as const,
      state: {
        status: "error" as const,
        message: "Refresh the page and try again.",
        fieldErrors: { draftId: ["Invalid draft id."] },
      },
    };
  }

  const draft = await prisma.listing.findFirst({
    where: { id: draftId, ownerUserId, status: ListingStatus.DRAFT, deletedAt: null },
    select: { id: true },
  });

  if (!draft) {
    return {
      ok: false as const,
      state: {
        status: "error" as const,
        message: "This draft is no longer available.",
        fieldErrors: { draftId: ["Draft not found."] },
      },
    };
  }

  return { ok: true as const, draftId: draft.id };
}

async function queryOwnedDraft(ownerUserId: string, draftId: string) {
  const draft = await prisma.listing.findFirst({
    where: { id: draftId, ownerUserId, status: ListingStatus.DRAFT, deletedAt: null },
    select: draftSelect,
  });

  return draft ? toDraftDTO(draft) : null;
}

async function findDefaultDraftCategory() {
  const category = await prisma.category.findFirst({
    where: {
      domainType: CategoryDomainType.LISTING,
      isActive: true,
      parentId: { not: null },
      children: { none: { domainType: CategoryDomainType.LISTING, isActive: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });

  if (!category) {
    throw new ApplicationError("NOT_FOUND", { message: "No listing category is available." });
  }

  return category;
}

async function loadSelectedCategory(categoryId: string) {
  if (!uuidPattern.test(categoryId)) {
    return null;
  }

  return prisma.category.findFirst({
    where: { id: categoryId, domainType: CategoryDomainType.LISTING, isActive: true },
    select: {
      id: true,
      children: { where: { domainType: CategoryDomainType.LISTING, isActive: true }, select: { id: true } },
      attributeDefinitions: {
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: categoryAttributeSelect,
      },
    },
  }).then((category) =>
    category
      ? {
          id: category.id,
          children: category.children,
          attributes: category.attributeDefinitions.map(toAttributeDTO),
        }
      : null,
  );
}

function validateAttributes(
  definitions: AttributeDefinition[],
  values: Record<string, FormDataEntryValue | FormDataEntryValue[]>,
  fieldErrors: Record<string, string[]>,
  { requireComplete }: { requireComplete: boolean },
) {
  const definitionByKey = new Map(definitions.map((definition) => [definition.key, definition]));
  const attributes: ValidatedAttributeValue[] = [];

  for (const key of Object.keys(values)) {
    if (!definitionByKey.has(key)) {
      fieldErrors[`attr_${key}`] = ["This detail is not valid for the selected category."];
    }
  }

  for (const definition of definitions) {
    const fieldName = `attr_${definition.key}`;
    const parsed = parseAttributeValue(definition, values[definition.key]);

    if (!parsed.ok) {
      if (parsed.message || (definition.isRequired && requireComplete)) {
        fieldErrors[fieldName] = [parsed.message ?? `${definition.label} is required.`];
      }
      continue;
    }

    if (parsed.value) {
      attributes.push({
        attributeDefinitionId: definition.id,
        ...parsed.value,
      });
    }
  }

  return attributes;
}

function parseAttributeValue(
  definition: AttributeDefinition,
  raw: FormDataEntryValue | FormDataEntryValue[] | undefined,
):
  | { ok: true; value: Omit<ValidatedAttributeValue, "attributeDefinitionId"> | null }
  | { ok: false; message?: string } {
  if (definition.dataType === AttributeDataType.MULTI_ENUM) {
    const rawValues = Array.isArray(raw) ? raw.map(stringValue) : stringValue(raw).split(",");
    const values = rawValues.map((value) => value.trim()).filter(Boolean);
    if (!values.length) {
      return { ok: true, value: null };
    }
    const allowed = new Set(definition.options.map((option) => option.value));
    if (values.some((value) => !allowed.has(value))) {
      return { ok: false, message: `Choose valid ${definition.label.toLowerCase()} options.` };
    }
    return { ok: true, value: { multiOptionJson: values } };
  }

  const value = normalizeText(stringValue(Array.isArray(raw) ? raw[0] : raw));
  if (!value) {
    return { ok: true, value: null };
  }

  if (definition.dataType === AttributeDataType.TEXT) {
    if (value.length > TEXT_ATTRIBUTE_MAX_LENGTH) {
      return { ok: false, message: `Keep ${definition.label.toLowerCase()} under ${TEXT_ATTRIBUTE_MAX_LENGTH} characters.` };
    }
    return { ok: true, value: { textValue: value } };
  }

  if (definition.dataType === AttributeDataType.INTEGER) {
    if (!/^-?\d+$/.test(value)) {
      return { ok: false, message: `Enter a whole number for ${definition.label.toLowerCase()}.` };
    }
    const number = Number(value);
    const rangeError = validateNumberRange(number, definition);
    return rangeError ? { ok: false, message: rangeError } : { ok: true, value: { integerValue: number } };
  }

  if (definition.dataType === AttributeDataType.DECIMAL) {
    if (!/^-?\d+(\.\d{1,4})?$/.test(value)) {
      return { ok: false, message: `Enter a valid number for ${definition.label.toLowerCase()}.` };
    }
    const number = Number(value);
    const rangeError = validateNumberRange(number, definition);
    return rangeError ? { ok: false, message: rangeError } : { ok: true, value: { decimalValue: value } };
  }

  if (definition.dataType === AttributeDataType.BOOLEAN) {
    if (value !== "true" && value !== "false") {
      return { ok: false, message: `Choose yes or no for ${definition.label.toLowerCase()}.` };
    }
    return { ok: true, value: { booleanValue: value === "true" } };
  }

  if (definition.dataType === AttributeDataType.ENUM) {
    if (!definition.options.some((option) => option.value === value)) {
      return { ok: false, message: `Choose a valid ${definition.label.toLowerCase()}.` };
    }
    return { ok: true, value: { optionValue: value } };
  }

  if (definition.dataType === AttributeDataType.DATE) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { ok: false, message: `Enter a valid date for ${definition.label.toLowerCase()}.` };
    }
    return { ok: true, value: { dateValue: new Date(`${value}T00:00:00.000Z`) } };
  }

  return { ok: false, message: `Unsupported ${definition.label.toLowerCase()} value.` };
}

function parsePrice(
  value: string,
  priceType: PriceType,
  { required }: { required: boolean },
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (priceType === PriceType.FREE || priceType === PriceType.CONTACT) {
    return { ok: true, value: null };
  }

  const trimmed = value.trim().replace(/[$,]/g, "");
  if (!trimmed && !required) {
    return { ok: true, value: null };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, message: "Enter a valid price." };
  }

  const [dollarsPart, centsPart = ""] = trimmed.split(".");
  const cents = Number(dollarsPart) * 100 + Number(centsPart.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > MAX_PRICE_CENTS) {
    return { ok: false, message: "Enter a price from $0 to $10,000,000." };
  }

  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;
  return { ok: true, value: `${dollars}.${remainder.toString().padStart(2, "0")}` };
}

function validateNumberRange(value: number, definition: AttributeDefinition) {
  if (!Number.isFinite(value)) {
    return `Enter a valid number for ${definition.label.toLowerCase()}.`;
  }
  if (typeof definition.validation.min === "number" && value < definition.validation.min) {
    return `${definition.label} must be at least ${definition.validation.min}.`;
  }
  if (typeof definition.validation.max === "number" && value > definition.validation.max) {
    return `${definition.label} must be ${definition.validation.max} or less.`;
  }
  return null;
}

function validateMedia(files: File[]) {
  if (files.length > MAX_MEDIA_COUNT) {
    return `Add no more than ${MAX_MEDIA_COUNT} photos.`;
  }
  for (const file of files) {
    if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
      return "Photos must be JPG, PNG, or WebP images.";
    }
    if (file.size > MAX_MEDIA_SIZE_BYTES) {
      return "Each photo must be 8 MB or smaller.";
    }
  }
  if (files.length) {
    return "Photo upload storage is not available in this stage. Remove photos to publish.";
  }
  return null;
}

function consumeSubmissionToken(ownerUserId: string, token: string, now: Date): { ok: true } | { ok: false; state: PostListingActionState } {
  const expiresBefore = now.getTime() - submissionTokenTtlMs;
  for (const [key, consumedAt] of consumedSubmissionTokens) {
    if (consumedAt < expiresBefore) {
      consumedSubmissionTokens.delete(key);
    }
  }

  const key = `${ownerUserId}:${token}`;
  if (consumedSubmissionTokens.has(key)) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "This listing was already submitted. Refresh before posting again.",
        fieldErrors: { submissionToken: ["This submission was already used."] },
      },
    };
  }

  consumedSubmissionTokens.set(key, now.getTime());
  return { ok: true };
}

function toNestedAttributeCreate(value: ValidatedAttributeValue): Prisma.ListingAttributeValueCreateWithoutListingInput {
  return {
    attributeDefinition: { connect: { id: value.attributeDefinitionId } },
    textValue: value.textValue,
    integerValue: value.integerValue,
    decimalValue: value.decimalValue,
    booleanValue: value.booleanValue,
    dateValue: value.dateValue,
    optionValue: value.optionValue,
    multiOptionJson: value.multiOptionJson,
  };
}

function toAttributeDTO(definition: {
  id: string;
  key: string;
  label: string;
  dataType: AttributeDataType;
  isRequired: boolean;
  unit: string | null;
  sortOrder: number;
  validationJson: Prisma.JsonValue;
  options: Array<{ value: string; label: string; sortOrder: number }>;
}) {
  return {
    id: definition.id,
    key: definition.key,
    label: definition.label,
    dataType: definition.dataType,
    isRequired: definition.isRequired,
    unit: definition.unit,
    sortOrder: definition.sortOrder,
    validation: normalizeAttributeValidation(definition.validationJson),
    options: definition.options,
  };
}

function toDraftDTO(draft: Prisma.ListingGetPayload<{ select: typeof draftSelect }>): PostListingDraftDTO {
  const attributes: Record<string, string> = {};

  for (const value of draft.attributeValues) {
    const formatted = rawAttributeFormValue(value);
    if (formatted) {
      attributes[value.attributeDefinition.key] = formatted;
    }
  }

  return {
    id: draft.id,
    categoryId: draft.categoryId,
    title: draft.title === "Untitled draft" ? "" : draft.title,
    description: draft.description === "Draft listing in progress." ? "" : draft.description,
    price: draft.priceAmount == null ? "" : Number(draft.priceAmount).toFixed(2),
    priceType: draft.priceType,
    condition: draft.condition ?? "",
    publicLocationId: draft.publicLocationId ?? "",
    attributes,
    updatedAt: draft.updatedAt.toISOString(),
  };
}

function rawAttributeFormValue(value: {
  textValue: string | null;
  integerValue: number | null;
  decimalValue: unknown | null;
  booleanValue: boolean | null;
  dateValue: Date | null;
  optionValue: string | null;
  multiOptionJson: Prisma.JsonValue | null;
}) {
  if (value.textValue) {
    return value.textValue;
  }
  if (value.integerValue != null) {
    return String(value.integerValue);
  }
  if (value.decimalValue != null) {
    return String(value.decimalValue);
  }
  if (value.booleanValue != null) {
    return String(value.booleanValue);
  }
  if (value.dateValue) {
    return value.dateValue.toISOString().slice(0, 10);
  }
  if (value.optionValue) {
    return value.optionValue;
  }
  if (Array.isArray(value.multiOptionJson)) {
    return value.multiOptionJson.filter((item): item is string => typeof item === "string").join(",");
  }
  return "";
}

function failureState(message: string): CreateListingResult {
  return {
    ok: false,
    state: {
      status: "error",
      message,
    },
  };
}

function normalizeAttributeValidation(value: Prisma.JsonValue): AttributeValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return {
    min: typeof value.min === "number" ? value.min : undefined,
    max: typeof value.max === "number" ? value.max : undefined,
  };
}

function parsePriceType(value: string) {
  return listingPriceTypes.includes(value as (typeof listingPriceTypes)[number]) ? (value as PriceType) : null;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMultilineText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stringValue(value: FormDataEntryValue | undefined | null) {
  return typeof value === "string" ? value : "";
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "listing";
}

function getPriceTypeLabel(value: PriceType) {
  if (value === PriceType.FIXED) {
    return "Fixed price";
  }
  if (value === PriceType.NEGOTIABLE) {
    return "Negotiable";
  }
  if (value === PriceType.FREE) {
    return "Free";
  }
  if (value === PriceType.CONTACT) {
    return "Contact for price";
  }
  if (value === PriceType.PER_MONTH) {
    return "Monthly rent";
  }
  return value;
}

const categoryAttributeSelect = {
  id: true,
  key: true,
  label: true,
  dataType: true,
  isRequired: true,
  unit: true,
  sortOrder: true,
  validationJson: true,
  options: {
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: { value: true, label: true, sortOrder: true },
  },
} satisfies Prisma.CategoryAttributeDefinitionSelect;

const publicLocationSelect = {
  id: true,
  name: true,
  type: true,
  regionCode: true,
  parent: {
    select: {
      name: true,
      type: true,
      regionCode: true,
      parent: { select: { name: true, type: true, regionCode: true } },
    },
  },
} satisfies Prisma.LocationSelect;

const draftSelect = {
  id: true,
  categoryId: true,
  title: true,
  description: true,
  priceAmount: true,
  priceType: true,
  condition: true,
  publicLocationId: true,
  updatedAt: true,
  attributeValues: {
    select: {
      textValue: true,
      integerValue: true,
      decimalValue: true,
      booleanValue: true,
      dateValue: true,
      optionValue: true,
      multiOptionJson: true,
      attributeDefinition: { select: { key: true } },
    },
  },
} satisfies Prisma.ListingSelect;
