"use server";

import { redirect } from "next/navigation";

import type { PostListingActionState } from "@/features/listings/post-listing-types";
import { publishListingDraftFromFormData, saveListingDraftFromFormData } from "@/server/marketplace/listing-create";
import { getCurrentUser } from "@/server/auth/session";

export async function saveListingDraftAction(
  _state: PostListingActionState,
  formData: FormData,
): Promise<PostListingActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Log in before saving this draft.",
    };
  }

  const result = await saveListingDraftFromFormData(user.id, formData);
  return result.state;
}

export async function publishListingAction(
  _state: PostListingActionState,
  formData: FormData,
): Promise<PostListingActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "error",
      message: "Log in before publishing this listing.",
    };
  }

  const result = await publishListingDraftFromFormData(user.id, formData);

  if (!result.ok) {
    return result.state;
  }

  redirect(result.href);
}
