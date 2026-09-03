import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserMock, requireActiveUserMock, getAccountProfileMock, updateProfileMock, transitionMock, updateListingMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  requireActiveUserMock: vi.fn(),
  getAccountProfileMock: vi.fn(),
  updateProfileMock: vi.fn(),
  transitionMock: vi.fn(),
  updateListingMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentUser: getCurrentUserMock,
  requireActiveUser: requireActiveUserMock,
}));

vi.mock("@/server/account/service", () => ({
  getAccountProfile: getAccountProfileMock,
  updateAccountProfileFromFormData: updateProfileMock,
  transitionOwnedListing: transitionMock,
}));

vi.mock("@/server/marketplace/listing-create", () => ({
  updateOwnedListingFromFormData: updateListingMock,
}));

vi.mock("@/features/auth/actions", () => ({
  logOutAction: vi.fn(),
}));

describe("account route and action authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAccountProfileMock.mockResolvedValue({
      displayName: "Amina D.",
      username: "demo-amina",
      bio: "",
      avatarUrl: "",
      publicLocationText: "Silver Spring, MD",
      isPublic: true,
      publicHref: "/users/demo-amina",
    });
  });

  it("account home requires an active user", async () => {
    requireActiveUserMock.mockResolvedValueOnce({ id: "owner-user-id" });
    const { default: AccountPage } = await import("@/app/account/page");

    await AccountPage();

    expect(requireActiveUserMock).toHaveBeenCalledWith("/account");
    expect(getAccountProfileMock).toHaveBeenCalledWith("owner-user-id");
  });

  it("profile updates reject unauthenticated server action calls", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    const { updateProfileAction } = await import("@/features/account/actions");

    const result = await updateProfileAction({ status: "idle" }, new FormData());

    expect(result).toEqual({ status: "error", message: "Log in before updating your profile." });
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("lifecycle action derives owner from session", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-user-id" });
    const { listingLifecycleAction } = await import("@/features/account/actions");
    const formData = new FormData();
    formData.set("listingId", "33333333-3333-4333-8333-333333333333");
    formData.set("ownerUserId", "attacker-user-id");
    formData.set("action", "archive");

    await listingLifecycleAction(formData);

    expect(transitionMock).toHaveBeenCalledWith(
      "owner-user-id",
      "33333333-3333-4333-8333-333333333333",
      "archive",
    );
  });
});
