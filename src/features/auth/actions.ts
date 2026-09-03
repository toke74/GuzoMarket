"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  genericAuthError,
  genericRecoveryMessage,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  type AuthActionState,
} from "@/features/auth/validation";
import { normalizeEmail, authenticateUser, registerUser } from "@/server/auth/service";
import { setSessionCookie, clearSessionCookie, revokeSession, authSessionCookieName } from "@/server/auth/session";
import { createAuthToken, consumePasswordResetToken } from "@/server/auth/tokens";
import { hashPassword } from "@/server/auth/password";
import { prisma } from "@/server/db/client";
import { AuthTokenType, UserStatus } from "@/server/db/generated/prisma/enums";
import { sendEmailVerificationEmail, sendPasswordResetEmail } from "@/server/email/auth-emails";
import { checkRateLimit } from "@/server/rate-limit/memory";

function flattenErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  return error.flatten().fieldErrors;
}

async function rateLimitKey(action: string, subject?: string) {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || headerStore.get("x-real-ip") || "local";
  return `${action}:${subject ?? "anonymous"}:${ip}`;
}

async function enforceRateLimit(action: string, subject: string | undefined, limit: number, windowMs: number) {
  const result = checkRateLimit({ key: await rateLimitKey(action, subject), limit, windowMs });
  return result.allowed;
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Review the highlighted fields.", fieldErrors: flattenErrors(parsed.error) };
  }

  if (!(await enforceRateLimit("register", normalizeEmail(parsed.data.email), 5, 60 * 60 * 1000))) {
    return { status: "error", message: genericAuthError };
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    return { status: "success", message: "If this email can be used, a verification message will be sent." };
  }

  redirect(`/auth/verify-email?email=${encodeURIComponent(parsed.data.email)}&returnTo=${encodeURIComponent(parsed.data.returnTo)}`);
}

export async function logInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: genericAuthError, fieldErrors: flattenErrors(parsed.error) };
  }

  if (!(await enforceRateLimit("login", normalizeEmail(parsed.data.email), 8, 15 * 60 * 1000))) {
    return { status: "error", message: genericAuthError };
  }

  const result = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return { status: "error", message: genericAuthError };
  }

  await setSessionCookie(result.session.rawToken, result.session.expiresAt);
  return { status: "success", redirectTo: parsed.data.returnTo };
}

export async function logOutAction() {
  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(authSessionCookieName)?.value);
  await clearSessionCookie();
  redirect("/");
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Review the highlighted fields.", fieldErrors: flattenErrors(parsed.error) };
  }

  if (!(await enforceRateLimit("password_reset", normalizeEmail(parsed.data.email), 5, 60 * 60 * 1000))) {
    return { status: "success", message: genericRecoveryMessage };
  }

  const user = await prisma.user.findUnique({
    where: { emailNormalized: normalizeEmail(parsed.data.email) },
    select: { id: true, status: true },
  });

  if (user?.status === UserStatus.ACTIVE) {
    const reset = await createAuthToken(user.id, AuthTokenType.PASSWORD_RESET);
    await sendPasswordResetEmail(parsed.data.email, reset.rawToken);
  }

  return { status: "success", message: genericRecoveryMessage };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Review the highlighted fields.", fieldErrors: flattenErrors(parsed.error) };
  }

  if (!(await enforceRateLimit("password_reset_confirm", undefined, 8, 15 * 60 * 1000))) {
    return { status: "error", message: genericAuthError };
  }

  const userId = await consumePasswordResetToken(parsed.data.token);

  if (!userId) {
    return { status: "error", message: "That reset link is invalid or expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: "USER",
        action: "password_reset_completed",
        entityType: "User",
        entityId: userId,
      },
    }),
  ]);

  return { status: "success", message: "Your password has been reset. You can log in now." };
}

export async function resendVerificationAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resendVerificationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { status: "error", message: "Review the highlighted fields.", fieldErrors: flattenErrors(parsed.error) };
  }

  if (!(await enforceRateLimit("verification_resend", normalizeEmail(parsed.data.email), 3, 60 * 60 * 1000))) {
    return { status: "success", message: genericRecoveryMessage };
  }

  const user = await prisma.user.findUnique({
    where: { emailNormalized: normalizeEmail(parsed.data.email) },
    select: { id: true, emailVerifiedAt: true, status: true },
  });

  if (user && !user.emailVerifiedAt && user.status === UserStatus.PENDING_VERIFICATION) {
    const verification = await createAuthToken(user.id, AuthTokenType.EMAIL_VERIFICATION);
    await sendEmailVerificationEmail(parsed.data.email, verification.rawToken);
  }

  return { status: "success", message: genericRecoveryMessage };
}
