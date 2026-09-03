"use client";

import {
  cloneElement,
  isValidElement,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactElement,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, MapPin, Save, Send } from "lucide-react";
import Link from "next/link";

import { publishListingAction, saveListingDraftAction } from "@/features/listings/actions";
import {
  initialPostListingActionState,
  type PostListingActionState,
  type PostListingCategoryDTO,
  type PostListingDraftDTO,
  type PostListingLocationDTO,
  type PostListingPriceTypeOption,
} from "@/features/listings/post-listing-types";
import { AttributeDataType, PriceType } from "@/server/db/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/feedback/alert";
import { cn } from "@/lib/utils";

type PostListingFormProps = {
  categories: PostListingCategoryDTO[];
  locations: PostListingLocationDTO[];
  priceTypes: PostListingPriceTypeOption[];
  conditions: Array<{ value: string; label: string }>;
  draft: PostListingDraftDTO;
  submissionToken: string;
  media: {
    maxCount: number;
    maxSizeBytes: number;
    acceptedTypes: string[];
  };
  mode?: "create" | "edit";
  title?: string;
  submitLabel?: string;
  pendingSubmitLabel?: string;
  actionOverride?: (
    state: PostListingActionState,
    formData: FormData,
  ) => Promise<PostListingActionState>;
};

const steps = ["Category", "Details", "Photos", "Location", "Review", "Publish"] as const;

export function PostListingForm({
  categories,
  locations,
  priceTypes,
  conditions,
  draft,
  submissionToken,
  media,
  mode = "create",
  title: formTitle = "Post a listing",
  submitLabel = "Publish listing",
  pendingSubmitLabel = "Publishing...",
  actionOverride,
}: PostListingFormProps) {
  const leafCategories = useMemo(() => categories.filter((category) => category.children.length === 0), [categories]);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(actionOverride ?? publishListingAction, initialPostListingActionState);
  const [saveState, setSaveState] = useState(initialPostListingActionState);
  const [isSaving, startSaving] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(draft.categoryId || leafCategories[0]?.id || "");
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [price, setPrice] = useState(draft.price);
  const [priceType, setPriceType] = useState<PriceType>(draft.priceType);
  const [condition, setCondition] = useState(draft.condition);
  const [publicLocationId, setPublicLocationId] = useState(draft.publicLocationId || locations[0]?.id || "");
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>(draft.attributes);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const selectedCategory = leafCategories.find((category) => category.id === selectedCategoryId) ?? leafCategories[0];
  const selectedLocation = locations.find((location) => location.id === publicLocationId);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const describedMediaLimit = `${media.maxCount} JPG, PNG, or WebP photos up to ${Math.round(media.maxSizeBytes / 1024 / 1024)} MB each. Photo uploads are temporarily unavailable. You can continue without photos.`;
  const activeState = state.status === "error" ? state : saveState.status === "error" ? saveState : state;

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) {
      return;
    }
    const firstField = Object.keys(state.fieldErrors)[0];
    if (!firstField) {
      return;
    }
    window.setTimeout(() => {
      setStepIndex(stepForField(firstField));
      window.setTimeout(() => document.getElementById(firstField)?.focus(), 50);
    }, 0);
  }, [state]);

  function saveDraft(advance: boolean) {
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    startSaving(async () => {
      const result = await saveListingDraftAction(saveState, formData);
      setSaveState(result);
      if (advance && result.status !== "error") {
        setStepIndex((value) => Math.min(value + 1, steps.length - 1));
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="grid min-w-0 gap-5" noValidate>
      <input type="hidden" name="draftId" value={draft.id} />
      <input type="hidden" name="submissionToken" value={submissionToken} />

      <div className="grid gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-primary">Step {stepIndex + 1} of {steps.length}</p>
            <h1 className="font-display text-2xl font-extrabold text-navy sm:text-3xl">{formTitle}</h1>
          </div>
          <p className="rounded-md bg-brand-light px-3 py-2 text-sm font-semibold text-brand-primary" aria-live="polite">
            {currentStep}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background p-3 text-sm text-text-secondary">
          <p>
            {mode === "edit" ? "Editing listing for this account." : "Draft saved for this account."} Last updated {new Date(draft.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.
            {saveState.status === "success" ? " Latest changes saved." : null}
          </p>
          {mode === "create" ? (
            <Link className="font-semibold text-brand-primary" href="/post?new=1">
              Start New Listing
            </Link>
          ) : null}
        </div>

        <ol className="grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6" aria-label="Listing posting progress">
          {steps.map((step, index) => (
            <li
              key={step}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md border px-3 py-2",
                index === stepIndex
                  ? "border-brand-primary bg-brand-light font-semibold text-brand-primary"
                  : index < stepIndex
                    ? "border-border bg-background text-text-primary"
                    : "border-border bg-surface text-text-secondary",
              )}
            >
              {index < stepIndex ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              <span className="min-w-0 break-words">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {activeState.status === "error" && activeState.message ? (
        <Alert variant="error" title={activeState.message}>
          Fix the highlighted fields and submit again.
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
        <section className={stepClass(stepIndex, 0)} aria-labelledby="post-category-heading">
          <StepHeading id="post-category-heading" title="Choose a category" description="Pick the most specific category so buyers see the right details." />
          <FieldError id="categoryId-error" errors={activeState.fieldErrors?.categoryId} />
          <div className="grid gap-3 sm:grid-cols-2">
            {leafCategories.map((category) => (
              <label
                key={category.id}
                className={cn(
                  "grid cursor-pointer gap-2 rounded-md border p-4 transition-colors",
                  selectedCategoryId === category.id ? "border-brand-primary bg-brand-light" : "border-border bg-background hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="categoryId"
                  value={category.id}
                  checked={selectedCategoryId === category.id}
                  onChange={() => {
                    setSelectedCategoryId(category.id);
                    setCondition("");
                  }}
                  className="sr-only"
                  aria-describedby={activeState.fieldErrors?.categoryId ? "categoryId-error" : undefined}
                />
                <span className="text-sm font-bold text-navy">{category.name}</span>
                <span className="text-xs font-semibold uppercase text-text-secondary">{category.parentName ?? "Marketplace"}</span>
                {category.description ? <span className="text-sm leading-6 text-text-secondary">{category.description}</span> : null}
              </label>
            ))}
          </div>
        </section>

        <section className={stepClass(stepIndex, 1)} aria-labelledby="post-details-heading">
          <StepHeading id="post-details-heading" title="Listing details" description="Use clear buyer-facing details and only the fields that match this category." />
          <div className="grid gap-4">
            <FormField id="title" label="Title" errors={activeState.fieldErrors?.title}>
              <Input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <FormField id="price" label={priceType === PriceType.PER_MONTH ? "Monthly rent" : "Price"} errors={activeState.fieldErrors?.price}>
                <Input
                  id="price"
                  name="price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  disabled={priceType === PriceType.FREE || priceType === PriceType.CONTACT}
                  aria-disabled={priceType === PriceType.FREE || priceType === PriceType.CONTACT}
                />
              </FormField>
              <FormField id="priceType" label="Price type" errors={activeState.fieldErrors?.priceType}>
                <Select id="priceType" name="priceType" value={priceType} onChange={(event) => setPriceType(event.target.value as PriceType)}>
                  {priceTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField id="condition" label="Condition" errors={activeState.fieldErrors?.condition} optional>
              <Select id="condition" name="condition" value={condition} onChange={(event) => setCondition(event.target.value)}>
                <option value="">Not applicable</option>
                {conditions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {selectedCategory?.attributes.length ? (
              <div className="grid gap-4 border-t border-border pt-4">
                <h2 className="font-display text-xl font-bold text-navy">{selectedCategory.name} details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedCategory.attributes.map((attribute) => (
                    <AttributeField
                      key={attribute.id}
                      attribute={attribute}
                      errors={activeState.fieldErrors?.[`attr_${attribute.key}`]}
                      value={attributeValues[attribute.key] ?? ""}
                      onValueChange={(value) => setAttributeValues((current) => ({ ...current, [attribute.key]: value }))}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-md bg-background p-3 text-sm text-text-secondary">No extra details are required for this category.</p>
            )}

            <FormField id="description" label="Description" errors={activeState.fieldErrors?.description}>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                maxLength={5000}
                rows={7}
              />
            </FormField>
          </div>
        </section>

        <section className={stepClass(stepIndex, 2)} aria-labelledby="post-media-heading">
          <StepHeading id="post-media-heading" title="Photos and media" description="Photo uploads are temporarily unavailable. You can continue without photos." />
          <FormField id="media" label="Photos" errors={activeState.fieldErrors?.media} hint={describedMediaLimit}>
            <div className="grid gap-3 rounded-md border border-dashed border-border-strong bg-background p-4">
              <ImagePlus className="h-8 w-8 text-brand-primary" aria-hidden="true" />
              <Input
                id="media"
                name="media"
                type="file"
                accept={media.acceptedTypes.join(",")}
                multiple
                onChange={(event) => setFileNames([...event.target.files ?? []].map((file) => file.name))}
              />
              {fileNames.length ? (
                <ul className="grid gap-1 text-sm text-text-secondary">
                  {fileNames.map((name) => (
                    <li key={name} className="break-words">{name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">You can continue without photos.</p>
              )}
            </div>
          </FormField>
        </section>

        <section className={stepClass(stepIndex, 3)} aria-labelledby="post-location-heading">
          <StepHeading id="post-location-heading" title="Public location" description="Choose the approximate area buyers will see. Street addresses and precise coordinates are not collected here." />
          <FormField id="publicLocationId" label="Approximate public location" errors={activeState.fieldErrors?.publicLocationId}>
            <Select id="publicLocationId" name="publicLocationId" value={publicLocationId} onChange={(event) => setPublicLocationId(event.target.value)} required>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex gap-3 rounded-md bg-brand-light p-4 text-sm leading-6 text-text-primary">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
            <p>
              Buyers will see approximately <span className="font-semibold">{selectedLocation?.label ?? "the selected area"}</span>. Private addresses, postal codes, and coordinates are not part of this posting flow.
            </p>
          </div>
        </section>

        <section className={stepClass(stepIndex, 4)} aria-labelledby="post-review-heading">
          <StepHeading id="post-review-heading" title="Review" description="Check the listing as buyers will understand it before publishing." />
          <div className="grid gap-4 rounded-md border border-border bg-background p-4">
            <div className="grid gap-2">
              <p className="text-2xl font-extrabold text-brand-primary">{formatReviewPrice(price, priceType)}</p>
              <h2 className="font-display text-2xl font-bold text-navy">{title || "Listing title"}</h2>
              <p className="text-sm font-medium text-text-secondary">{selectedCategory?.name ?? "Category"} / {selectedLocation?.label ?? "Location"}</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <ReviewItem label="Condition" value={condition ? conditionLabel(conditions, condition) : "Not provided"} />
              <ReviewItem label="Photos" value={fileNames.length ? `${fileNames.length} selected` : "No photos"} />
              {selectedCategory?.attributes.map((attribute) => (
                <ReviewItem key={attribute.id} label={attribute.label} value={formatAttributeReviewValue(attribute, attributeValues[attribute.key])} />
              ))}
            </dl>
            <p className="whitespace-pre-line break-words text-sm leading-7 text-text-primary">
              {description || "Description will appear here."}
            </p>
          </div>
        </section>

        <section className={stepClass(stepIndex, 5)} aria-labelledby="post-publish-heading">
          <StepHeading
            id="post-publish-heading"
            title={mode === "edit" ? "Save" : "Publish"}
            description={mode === "edit" ? "The server will validate every field again and preserve owner-only lifecycle rules." : "The server will validate every field again and create the listing under your account."}
          />
          <div className="grid gap-3 rounded-md border border-border bg-background p-4 text-sm leading-6 text-text-primary">
            <p>{mode === "edit" ? "The listing will keep its current editable lifecycle state." : "The listing will publish as active using the existing marketplace lifecycle."}</p>
            <p>Ownership, moderation state, featured status, private address fields, and exact coordinates are controlled by the server.</p>
          </div>
        </section>
      </div>

      <div className="sticky bottom-16 z-20 -mx-4 border-t border-border bg-surface/96 p-4 backdrop-blur sm:static sm:mx-0 sm:rounded-lg sm:border sm:shadow-sm md:bottom-0">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStepIndex((value) => Math.max(value - 1, 0))}
            disabled={stepIndex === 0 || pending || isSaving}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {mode === "create" ? (
              <Button type="button" variant="outline" onClick={() => saveDraft(false)} disabled={pending || isSaving}>
                <Save className="h-4 w-4" aria-hidden="true" />
                {isSaving ? "Saving..." : "Save draft"}
              </Button>
            ) : null}
            {isLastStep ? (
              <Button type="submit" disabled={pending || isSaving}>
                <Send className="h-4 w-4" aria-hidden="true" />
                {pending ? pendingSubmitLabel : submitLabel}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (mode === "create") {
                    saveDraft(true);
                    return;
                  }
                  setStepIndex((value) => Math.min(value + 1, steps.length - 1));
                }}
                disabled={pending || isSaving}
              >
                {isSaving ? "Saving..." : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function AttributeField({
  attribute,
  errors,
  value,
  onValueChange,
}: {
  attribute: PostListingCategoryDTO["attributes"][number];
  errors?: string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const id = `attr_${attribute.key}`;
  const label = attribute.unit ? `${attribute.label} (${attribute.unit})` : attribute.label;

  if (attribute.dataType === AttributeDataType.ENUM) {
    return (
      <FormField id={id} label={label} errors={errors} optional={!attribute.isRequired}>
        <Select id={id} name={id} required={attribute.isRequired} value={value} onChange={(event) => onValueChange(event.target.value)}>
          <option value="">Choose one</option>
          {attribute.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </FormField>
    );
  }

  if (attribute.dataType === AttributeDataType.BOOLEAN) {
    return (
      <FormField id={id} label={label} errors={errors} optional={!attribute.isRequired}>
        <Select id={id} name={id} required={attribute.isRequired} value={value} onChange={(event) => onValueChange(event.target.value)}>
          <option value="">Choose one</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </FormField>
    );
  }

  if (attribute.dataType === AttributeDataType.INTEGER || attribute.dataType === AttributeDataType.DECIMAL) {
    return (
      <FormField id={id} label={label} errors={errors} optional={!attribute.isRequired}>
        <Input
          id={id}
          name={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          inputMode={attribute.dataType === AttributeDataType.INTEGER ? "numeric" : "decimal"}
          required={attribute.isRequired}
          min={attribute.validation.min}
          max={attribute.validation.max}
          step={attribute.dataType === AttributeDataType.INTEGER ? 1 : 0.1}
        />
      </FormField>
    );
  }

  if (attribute.dataType === AttributeDataType.DATE) {
    return (
      <FormField id={id} label={label} errors={errors} optional={!attribute.isRequired}>
        <Input id={id} name={id} type="date" required={attribute.isRequired} value={value} onChange={(event) => onValueChange(event.target.value)} />
      </FormField>
    );
  }

  return (
    <FormField id={id} label={label} errors={errors} optional={!attribute.isRequired}>
      <Input id={id} name={id} required={attribute.isRequired} maxLength={120} value={value} onChange={(event) => onValueChange(event.target.value)} />
    </FormField>
  );
}

function StepHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h2 id={id} className="font-display text-2xl font-bold text-navy">{title}</h2>
      <p className="text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  );
}

function FormField({
  id,
  label,
  errors,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : "", errors?.length ? errorId : ""].filter(Boolean).join(" ") || undefined;
  const control =
    isValidElement(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>, {
          "aria-describedby": describedBy,
          "aria-invalid": errors?.length ? true : undefined,
        })
      : children;

  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optional ? <span className="text-xs font-medium text-text-secondary">Optional</span> : null}
      </div>
      {control}
      {hint ? <p id={hintId} className="text-sm leading-6 text-text-secondary">{hint}</p> : null}
      <FieldError id={errorId} errors={errors} />
    </div>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }
  return (
    <p id={id} className="text-sm font-medium text-error">
      {errors.join(" ")}
    </p>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-surface p-3">
      <dt className="text-xs font-bold uppercase text-text-secondary">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function stepClass(stepIndex: number, index: number) {
  return cn("min-w-0 gap-5", stepIndex === index ? "grid" : "hidden");
}

function conditionLabel(conditions: Array<{ value: string; label: string }>, value: string) {
  return conditions.find((condition) => condition.value === value)?.label ?? value;
}

function formatAttributeReviewValue(attribute: PostListingCategoryDTO["attributes"][number], value: string | undefined) {
  if (!value) {
    return attribute.isRequired ? "Required before publishing" : "Not provided";
  }
  if (attribute.dataType === AttributeDataType.ENUM) {
    return attribute.options.find((option) => option.value === value)?.label ?? value;
  }
  if (attribute.dataType === AttributeDataType.BOOLEAN) {
    return value === "true" ? "Yes" : "No";
  }
  return attribute.unit ? `${value} ${attribute.unit}` : value;
}

function stepForField(field: string) {
  if (field === "categoryId") {
    return 0;
  }
  if (field === "media") {
    return 2;
  }
  if (field === "publicLocationId") {
    return 3;
  }
  if (field === "submissionToken" || field === "draftId") {
    return 5;
  }
  return 1;
}

function formatReviewPrice(price: string, priceType: PriceType) {
  if (priceType === PriceType.FREE) {
    return "Free";
  }
  if (priceType === PriceType.CONTACT) {
    return "Contact for price";
  }
  const amount = Number(price.replace(/[$,]/g, ""));
  if (!Number.isFinite(amount) || amount < 0) {
    return "Needs price";
  }
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
  return priceType === PriceType.PER_MONTH ? `${formatted}/mo` : formatted;
}
