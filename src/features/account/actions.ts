"use server";

import { redirect } from "next/navigation";

import type { PostListingActionState } from "@/features/listings/post-listing-types";
import {
  type ProfileActionState,
  updateAccountProfileFromFormData,
  transitionOwnedListing,
  type OwnerListingAction,
} from "@/server/account/service";
import { getCurrentUser } from "@/server/auth/session";
import { updateOwnedListingFromFormData } from "@/server/marketplace/listing-create";

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Log in before updating your profile." };
  }

  return updateAccountProfileFromFormData(user.id, formData);
}

export async function updateListingAction(
  listingId: string,
  _state: PostListingActionState,
  formData: FormData,
): Promise<PostListingActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Log in before updating this listing." };
  }

  const result = await updateOwnedListingFromFormData(user.id, listingId, formData);
  if (!result.ok) {
    return result.state;
  }

  redirect(result.href);
}

export async function listingLifecycleAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/log-in?returnTo=/account/listings");
  }

  const listingId = String(formData.get("listingId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!isLifecycleMutation(action)) {
    throw new Error("Invalid listing action.");
  }

  await transitionOwnedListing(user.id, listingId, action);
}

function isLifecycleMutation(
  action: string,
): action is Exclude<OwnerListingAction, "view" | "edit" | "continue-draft"> {
  return ["mark-sold", "mark-rented", "mark-filled", "archive", "delete"].includes(action);
}
