import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AttributeDataType,
  CategoryDomainType,
  ListingStatus,
  LocationType,
  ModerationState,
  PriceType,
} from "@/server/db/generated/prisma/client";
import { queryPublicListingDetail } from "@/server/marketplace/listing-detail";
import {
  getOrCreatePostListingDraft,
  getOwnedListingEditDraft,
  publishListingDraftFromFormData,
  resetListingSubmissionTokensForTests,
  saveListingDraftFromFormData,
  updateOwnedListingFromFormData,
  validateCreateListingInput,
} from "@/server/marketplace/listing-create";

const { prismaMock, revalidatePathMock } = vi.hoisted(() => ({
  prismaMock: {
    category: { findFirst: vi.fn(), findMany: vi.fn() },
    location: { findFirst: vi.fn(), findMany: vi.fn() },
    marketplaceRegionLocation: { findFirst: vi.fn() },
    listing: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  revalidatePathMock: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: (fn: unknown) => fn };
});

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("listing creation and durable drafts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetListingSubmissionTokensForTests();
    prismaMock.category.findFirst.mockResolvedValue(categoryFixture());
    prismaMock.location.findFirst.mockResolvedValue(locationFixture());
    prismaMock.marketplaceRegionLocation.findFirst.mockResolvedValue({ id: "region-location-id" });
    prismaMock.listing.findFirst.mockResolvedValue(null);
    prismaMock.listing.findMany.mockResolvedValue([]);
    prismaMock.listing.create.mockResolvedValue(draftRow());
    prismaMock.listing.update.mockResolvedValue({ id: draftRow().id, slug: "2016-toyota-camry-se" });
    prismaMock.listing.updateMany.mockResolvedValue({ count: 1 });
  });

  it("uses the existing DRAFT lifecycle when starting the posting flow", async () => {
    prismaMock.category.findFirst.mockResolvedValueOnce({ id: "11111111-1111-4111-8111-111111111111" });

    const draft = await getOrCreatePostListingDraft({ ownerUserId: "owner-user-id" });

    expect(draft.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(prismaMock.listing.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerUserId: "owner-user-id",
          status: ListingStatus.DRAFT,
          moderationState: ModerationState.NOT_REVIEWED,
          isFeatured: false,
        }),
      }),
    );
  });

  it("owner can resume own draft with persisted valid data", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce(draftRow({ title: "Saved Toyota Camry", priceAmount: "9200.00" }));

    const draft = await getOrCreatePostListingDraft({
      ownerUserId: "owner-user-id",
      draftId: "33333333-3333-4333-8333-333333333333",
    });

    expect(prismaMock.listing.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "33333333-3333-4333-8333-333333333333",
          ownerUserId: "owner-user-id",
          status: ListingStatus.DRAFT,
          deletedAt: null,
        },
      }),
    );
    expect(draft).toMatchObject({
      id: "33333333-3333-4333-8333-333333333333",
      title: "Saved Toyota Camry",
      price: "9200.00",
      attributes: { make: "toyota", model: "Camry SE", year: "2016" },
    });
  });

  it("another user cannot access or update a draft by manipulating the id", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce(null);

    await expect(
      getOrCreatePostListingDraft({
        ownerUserId: "attacker-user-id",
        draftId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toThrow("Draft not found.");

    const saveResult = await saveListingDraftFromFormData("attacker-user-id", validFormData());
    expect(saveResult.ok).toBe(false);
    expect(prismaMock.listing.update).not.toHaveBeenCalled();
  });

  it("another user cannot open an owned listing for edit", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce(null);

    await expect(
      getOwnedListingEditDraft("attacker-user-id", "33333333-3333-4333-8333-333333333333"),
    ).rejects.toThrow("Listing not found or not editable.");
  });

  it("updates only an owned editable listing and strips privileged edit fields", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({
      id: "33333333-3333-4333-8333-333333333333",
      status: ListingStatus.ACTIVE,
      publishedAt: new Date("2026-08-30T12:00:00.000Z"),
    });
    prismaMock.listing.update.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333", slug: "2016-toyota-camry-se" });
    const formData = validFormData({
      ownerUserId: "attacker-user-id",
      status: ListingStatus.REMOVED,
      moderationState: ModerationState.REMOVED,
      latitude: "38.9",
      longitude: "-77.0",
    });

    const result = await updateOwnedListingFromFormData("owner-user-id", "33333333-3333-4333-8333-333333333333", formData);

    expect(result).toEqual({ ok: true, href: "/listings/2016-toyota-camry-se-33333333-3333-4333-8333-333333333333" });
    expect(prismaMock.listing.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "33333333-3333-4333-8333-333333333333",
          ownerUserId: "owner-user-id",
          status: { in: [ListingStatus.ACTIVE, ListingStatus.PENDING_REVIEW] },
          deletedAt: null,
        },
        data: expect.objectContaining({
          latitude: null,
          longitude: null,
          postalCode: null,
        }),
      }),
    );
    expect(prismaMock.listing.updateMany.mock.calls[0][0].data).not.toHaveProperty("ownerUserId");
    expect(prismaMock.listing.updateMany.mock.calls[0][0].data).not.toHaveProperty("status");
    expect(prismaMock.listing.updateMany.mock.calls[0][0].data).not.toHaveProperty("moderationState");
  });

  it("save preserves valid progress server-side for refresh/resume", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
    prismaMock.listing.update.mockResolvedValueOnce(draftRow({ title: "Saved Toyota Camry", priceAmount: "9200.00" }));

    const result = await saveListingDraftFromFormData("owner-user-id", validFormData());

    expect(result.ok).toBe(true);
    expect(prismaMock.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "33333333-3333-4333-8333-333333333333" },
        data: expect.objectContaining({
          status: ListingStatus.DRAFT,
          moderationState: ModerationState.NOT_REVIEWED,
          publishedAt: null,
          latitude: null,
          longitude: null,
          postalCode: null,
          attributeValues: {
            deleteMany: {},
            create: expect.arrayContaining([
              expect.objectContaining({ optionValue: "toyota" }),
              expect.objectContaining({ textValue: "Camry SE" }),
              expect.objectContaining({ integerValue: 2016 }),
            ]),
          },
        }),
      }),
    );
  });

  it("draft is not publicly discoverable through Stage 9 listing detail", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce({
      ...publicListingFixture(),
      status: ListingStatus.DRAFT,
      moderationState: ModerationState.NOT_REVIEWED,
    });

    const detail = await queryPublicListingDetail("saved-draft-33333333-3333-4333-8333-333333333333");

    expect(detail).toBeNull();
  });

  it("final publish transitions the intended owned draft exactly once", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });

    const result = await publishListingDraftFromFormData("owner-user-id", validFormData(), new Date("2026-08-30T12:00:00.000Z"));

    expect(result).toEqual({ ok: true, href: "/listings/2016-toyota-camry-se-33333333-3333-4333-8333-333333333333" });
    expect(prismaMock.listing.updateMany).toHaveBeenCalledWith({
      where: {
        id: "33333333-3333-4333-8333-333333333333",
        ownerUserId: "owner-user-id",
        status: ListingStatus.DRAFT,
        deletedAt: null,
      },
      data: expect.objectContaining({
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        isFeatured: false,
        publishedAt: new Date("2026-08-30T12:00:00.000Z"),
      }),
    });
    expect(prismaMock.listing.updateMany.mock.calls[0][0].data).not.toHaveProperty("ownerUserId");
    expect(prismaMock.listing.update).toHaveBeenCalledTimes(1);
  });

  it("duplicate publish protection prevents activating twice", async () => {
    prismaMock.listing.findFirst.mockResolvedValue({ id: "33333333-3333-4333-8333-333333333333" });
    const now = new Date("2026-08-30T12:00:00.000Z");

    const first = await publishListingDraftFromFormData("owner-user-id", validFormData(), now);
    const second = await publishListingDraftFromFormData("owner-user-id", validFormData(), now);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.state.fieldErrors?.submissionToken).toEqual(["This submission was already used."]);
    }
    expect(prismaMock.listing.updateMany).toHaveBeenCalledTimes(1);
  });

  it("malformed draft id is safely rejected", async () => {
    await expect(
      getOrCreatePostListingDraft({ ownerUserId: "owner-user-id", draftId: "not-a-uuid" }),
    ).rejects.toThrow("Invalid draft id.");

    const formData = validFormData({ draftId: "not-a-uuid" });
    const result = await publishListingDraftFromFormData("owner-user-id", formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.draftId).toEqual(["Invalid draft id."]);
    }
  });

  it("abandoned or incomplete drafts cannot become active through client manipulation", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });

    const result = await publishListingDraftFromFormData(
      "owner-user-id",
      validFormData({
        title: "short",
        description: "too short",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.APPROVED,
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.title).toBeDefined();
      expect(result.state.fieldErrors?.description).toBeDefined();
    }
    expect(prismaMock.listing.updateMany).not.toHaveBeenCalled();
  });

  it("rejects unknown or invalid category-specific attributes", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
    const formData = validFormData({
      attr_make: "not-a-real-make",
      attr_hack: "script",
    });

    const result = await publishListingDraftFromFormData("owner-user-id", formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.attr_make).toEqual(["Choose a valid make."]);
      expect(result.state.fieldErrors?.attr_hack).toEqual(["This detail is not valid for the selected category."]);
    }
  });

  it("treats condition as a core listing field instead of a category attribute", async () => {
    prismaMock.category.findFirst.mockResolvedValue(categoryFixture({ includeDuplicateConditionAttribute: true }));
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
    const formData = validFormData({
      condition: "good",
      attr_condition: "fair",
    });

    const result = await publishListingDraftFromFormData("owner-user-id", formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.attr_condition).toEqual(["This detail is not valid for the selected category."]);
    }
    expect(prismaMock.listing.updateMany).not.toHaveBeenCalled();
  });

  it("rejects malformed, negative, or out-of-range prices", async () => {
    await expectValidationError(validFormData({ price: "-1" }), "price", "Enter a valid price.");
    await expectValidationError(validFormData({ price: "10000000.01" }), "price", "Enter a price from $0 to $10,000,000.");
    await expectValidationError(validFormData({ price: "12.999" }), "price", "Enter a valid price.");
  });

  it("permits publishing without photos but rejects attempted local or remote media inputs", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
    await expect(publishListingDraftFromFormData("owner-user-id", validFormData())).resolves.toMatchObject({ ok: true });

    resetListingSubmissionTokensForTests();
    vi.clearAllMocks();
    prismaMock.category.findFirst.mockResolvedValue(categoryFixture());
    prismaMock.location.findFirst.mockResolvedValue(locationFixture());
    prismaMock.marketplaceRegionLocation.findFirst.mockResolvedValue({ id: "region-location-id" });
    prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
    const formData = validFormData({ mediaUrl: "file:///C:/secret.jpg", imagePath: "C:\\secret.jpg" });
    formData.append("media", new File(["fake"], "car.png", { type: "image/png" }));

    const result = await publishListingDraftFromFormData("owner-user-id", formData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.media).toEqual([
        "Photo uploads are temporarily unavailable. You can continue without photos.",
      ]);
    }
    expect(prismaMock.listing.updateMany).not.toHaveBeenCalled();
  });

  it("validates raw payloads without accepting arbitrary private DTO fields", async () => {
    const result = await validateCreateListingInput({
      draftId: "33333333-3333-4333-8333-333333333333",
      submissionToken: "token-123",
      categoryId: "11111111-1111-4111-8111-111111111111",
      title: "Clean dining table",
      description: "A solid table ready for pickup in good condition.",
      price: "180",
      priceType: PriceType.FIXED,
      condition: "good",
      publicLocationId: "22222222-2222-4222-8222-222222222222",
      attributeValues: {
        make: "toyota",
        model: "Camry SE",
        year: "2016",
      },
      media: [],
      ownerUserId: "malicious",
      verificationStatus: "VERIFIED",
    } as never);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).not.toHaveProperty("ownerUserId");
      expect(result.data).not.toHaveProperty("verificationStatus");
    }
  });
});

async function expectValidationError(formData: FormData, field: string, message: string) {
  prismaMock.listing.findFirst.mockResolvedValueOnce({ id: "33333333-3333-4333-8333-333333333333" });
  const result = await publishListingDraftFromFormData("owner-user-id", formData);
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.state.fieldErrors?.[field]).toEqual([message]);
  }
}

function validFormData(overrides: Record<string, string> = {}) {
  const values = {
    draftId: "33333333-3333-4333-8333-333333333333",
    submissionToken: "44444444-4444-4444-8444-444444444444",
    categoryId: "11111111-1111-4111-8111-111111111111",
    title: "2016 Toyota Camry SE",
    description: "Clean commuter sedan with a clear title and recent maintenance.",
    price: "9200",
    priceType: PriceType.NEGOTIABLE,
    condition: "good",
    publicLocationId: "22222222-2222-4222-8222-222222222222",
    attr_make: "toyota",
    attr_model: "Camry SE",
    attr_year: "2016",
    attr_mileage: "84500",
    attr_transmission: "automatic",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

function categoryFixture({
  includeDuplicateConditionAttribute = false,
}: { includeDuplicateConditionAttribute?: boolean } = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    children: [],
    domainType: CategoryDomainType.LISTING,
    attributeDefinitions: [
      ...(includeDuplicateConditionAttribute
        ? [
            attributeFixture("condition", "Condition", AttributeDataType.ENUM, true, undefined, [
              { value: "new", label: "New", sortOrder: 10 },
              { value: "good", label: "Good", sortOrder: 20 },
              { value: "fair", label: "Fair", sortOrder: 30 },
            ]),
          ]
        : []),
      attributeFixture("make", "Make", AttributeDataType.ENUM, true, undefined, [
        { value: "toyota", label: "Toyota", sortOrder: 10 },
        { value: "honda", label: "Honda", sortOrder: 20 },
      ]),
      attributeFixture("model", "Model", AttributeDataType.TEXT, true),
      attributeFixture("year", "Year", AttributeDataType.INTEGER, true, { min: 1980, max: 2027 }),
      attributeFixture("mileage", "Mileage", AttributeDataType.INTEGER, false, { min: 0 }),
      attributeFixture("transmission", "Transmission", AttributeDataType.ENUM, false, undefined, [
        { value: "automatic", label: "Automatic", sortOrder: 10 },
        { value: "manual", label: "Manual", sortOrder: 20 },
      ]),
    ],
  };
}

function attributeFixture(
  key: string,
  label: string,
  dataType: AttributeDataType,
  isRequired: boolean,
  validationJson?: { min?: number; max?: number },
  options: Array<{ value: string; label: string; sortOrder: number }> = [],
) {
  return {
    id: `attribute-${key}`,
    key,
    label,
    dataType,
    isRequired,
    unit: null,
    sortOrder: 10,
    validationJson: validationJson ?? null,
    options,
  };
}

function locationFixture() {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    type: LocationType.CITY,
    parent: null,
  };
}

function draftRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    categoryId: "11111111-1111-4111-8111-111111111111",
    title: "Untitled draft",
    description: "Draft listing in progress.",
    priceAmount: null,
    priceType: PriceType.CONTACT,
    condition: null,
    publicLocationId: null,
    updatedAt: new Date("2026-08-30T12:00:00.000Z"),
    attributeValues: [
      attributeValue("make", { optionValue: "toyota" }),
      attributeValue("model", { textValue: "Camry SE" }),
      attributeValue("year", { integerValue: 2016 }),
    ],
    ...overrides,
  };
}

function attributeValue(key: string, overrides: Record<string, unknown>) {
  return {
    textValue: null,
    integerValue: null,
    decimalValue: null,
    booleanValue: null,
    dateValue: null,
    optionValue: null,
    multiOptionJson: null,
    attributeDefinition: { key },
    ...overrides,
  };
}

function publicListingFixture() {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    ownerUserId: "owner-user-id",
    categoryId: "11111111-1111-4111-8111-111111111111",
    title: "Saved draft",
    slug: "saved-draft",
    description: "A draft listing that must not be public.",
    priceAmount: "9200.00",
    priceCurrency: "USD",
    priceType: PriceType.NEGOTIABLE,
    condition: "good",
    status: ListingStatus.DRAFT,
    moderationState: ModerationState.NOT_REVIEWED,
    availabilityText: null,
    isFeatured: false,
    publishedAt: null,
    createdAt: new Date("2026-08-30T12:00:00.000Z"),
    deletedAt: null,
    category: { id: "cat", name: "Cars", slug: "cars", parent: { name: "Cars & Vehicles", slug: "cars-vehicles" } },
    publicLocation: {
      name: "Washington",
      type: LocationType.CITY,
      regionCode: "DC",
      parent: null,
    },
    images: [],
    attributeValues: [],
    owner: {
      id: "owner-user-id",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
      emailVerifiedAt: new Date("2026-01-02T12:00:00.000Z"),
      profile: null,
      verifications: [],
    },
  };
}
