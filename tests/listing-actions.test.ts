import { beforeEach, describe, expect, it, vi } from "vitest";

import { publishListingAction, saveListingDraftAction } from "@/features/listings/actions";
import { initialPostListingActionState } from "@/features/listings/post-listing-types";

const { getCurrentUserMock, publishListingDraftFromFormDataMock, saveListingDraftFromFormDataMock, redirectMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  publishListingDraftFromFormDataMock: vi.fn(),
  saveListingDraftFromFormDataMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock("@/server/marketplace/listing-create", () => ({
  publishListingDraftFromFormData: publishListingDraftFromFormDataMock,
  saveListingDraftFromFormData: saveListingDraftFromFormDataMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("listing server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication before publishing", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    const result = await publishListingAction(initialPostListingActionState, new FormData());

    expect(result).toEqual({
      status: "error",
      message: "Log in before publishing this listing.",
    });
    expect(publishListingDraftFromFormDataMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("requires authentication before saving a draft", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    const result = await saveListingDraftAction(initialPostListingActionState, new FormData());

    expect(result).toEqual({
      status: "error",
      message: "Log in before saving this draft.",
    });
    expect(saveListingDraftFromFormDataMock).not.toHaveBeenCalled();
  });

  it("publishes only for the authenticated user and redirects to the resulting listing", async () => {
    const formData = new FormData();
    getCurrentUserMock.mockResolvedValueOnce({ id: "authenticated-user-id" });
    publishListingDraftFromFormDataMock.mockResolvedValueOnce({ ok: true, href: "/listings/demo-id" });

    await publishListingAction(initialPostListingActionState, formData);

    expect(publishListingDraftFromFormDataMock).toHaveBeenCalledWith("authenticated-user-id", formData);
    expect(redirectMock).toHaveBeenCalledWith("/listings/demo-id");
  });

  it("saves drafts only for the authenticated user", async () => {
    const formData = new FormData();
    getCurrentUserMock.mockResolvedValueOnce({ id: "authenticated-user-id" });
    saveListingDraftFromFormDataMock.mockResolvedValueOnce({ ok: true, state: { status: "success", message: "Draft saved." } });

    const result = await saveListingDraftAction(initialPostListingActionState, formData);

    expect(result).toEqual({ status: "success", message: "Draft saved." });
    expect(saveListingDraftFromFormDataMock).toHaveBeenCalledWith("authenticated-user-id", formData);
  });
});
