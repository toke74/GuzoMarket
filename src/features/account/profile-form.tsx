"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Eye, Save } from "lucide-react";

import { updateProfileAction } from "@/features/account/actions";
import { type AccountProfileDTO, type ProfileActionState } from "@/server/account/service";
import { Alert } from "@/components/feedback/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ProfileActionState = { status: "idle" };

export function ProfileForm({ profile }: { profile: AccountProfileDTO }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form action={action} className="grid gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">Profile</h1>
          <p className="mt-1 text-sm leading-6 text-text-secondary">Edit the public fields shown on your seller profile.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={profile.publicHref}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Public Profile
          </Link>
        </Button>
      </div>

      {state.status === "error" && state.message ? (
        <Alert variant="error" title={state.message}>
          Private account fields cannot be changed here.
        </Alert>
      ) : null}
      {state.status === "success" && state.message ? <Alert variant="success" title={state.message} /> : null}

      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <Avatar className="h-24 w-24">
            {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <p className="text-sm leading-6 text-text-secondary">Avatar upload storage is not enabled yet. Use an HTTPS or site-relative image URL.</p>
        </div>

        <div className="grid min-w-0 gap-4">
          <ProfileField id="displayName" label="Display name" errors={state.fieldErrors?.displayName}>
            <Input id="displayName" name="displayName" defaultValue={profile.displayName} maxLength={80} required />
          </ProfileField>
          <ProfileField id="username" label="Username" errors={state.fieldErrors?.username} optional>
            <Input id="username" name="username" defaultValue={profile.username} maxLength={30} autoCapitalize="none" />
          </ProfileField>
          <ProfileField id="avatarUrl" label="Avatar URL" errors={state.fieldErrors?.avatarUrl} optional>
            <Input id="avatarUrl" name="avatarUrl" defaultValue={profile.avatarUrl} inputMode="url" />
          </ProfileField>
          <ProfileField id="publicLocationText" label="Public city/region" errors={state.fieldErrors?.publicLocationText} optional>
            <Input id="publicLocationText" name="publicLocationText" defaultValue={profile.publicLocationText} maxLength={80} />
          </ProfileField>
          <ProfileField id="bio" label="Bio" errors={state.fieldErrors?.bio} optional>
            <Textarea id="bio" name="bio" defaultValue={profile.bio} rows={6} maxLength={500} />
          </ProfileField>
          <label className="flex min-h-11 items-start gap-3 rounded-md border border-border bg-background p-3">
            <input name="isPublic" type="checkbox" defaultChecked={profile.isPublic} className="mt-1 h-4 w-4" />
            <span className="grid gap-1">
              <span className="text-sm font-semibold text-text-primary">Public profile visibility</span>
              <span className="text-sm leading-6 text-text-secondary">When off, seller profile DTOs hide your profile details from public pages.</span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function ProfileField({
  id,
  label,
  errors,
  optional,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optional ? <span className="text-xs font-medium text-text-secondary">Optional</span> : null}
      </div>
      {children}
      {errors?.length ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
