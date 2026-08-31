import type { AttributeDataType, PriceType } from "@/server/db/generated/prisma/enums";

export type PostListingActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  draftId?: string;
  savedAt?: string;
};

export const initialPostListingActionState: PostListingActionState = { status: "idle" };

export type PostListingAttributeDTO = {
  id: string;
  key: string;
  label: string;
  dataType: AttributeDataType;
  isRequired: boolean;
  unit: string | null;
  sortOrder: number;
  validation: {
    min?: number;
    max?: number;
  };
  options: Array<{ value: string; label: string; sortOrder: number }>;
};

export type PostListingCategoryDTO = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  parentName: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
  attributes: PostListingAttributeDTO[];
};

export type PostListingLocationDTO = {
  id: string;
  name: string;
  label: string;
};

export type PostListingPriceTypeOption = {
  value: PriceType;
  label: string;
};

export type PostListingDraftDTO = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: string;
  priceType: PriceType;
  condition: string;
  publicLocationId: string;
  attributes: Record<string, string>;
  updatedAt: string;
};
