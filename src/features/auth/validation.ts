import { z } from "zod";

import { passwordPolicy, validatePasswordPolicy } from "@/server/auth/password";
import { normalizeReturnTo } from "@/server/auth/redirects";

export const genericAuthError = "We could not complete that request. Check your details and try again.";
export const genericRecoveryMessage =
  "If an account matches that email, instructions will be sent shortly.";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAuthActionState: AuthActionState = { status: "idle" };

const passwordSchema = z
  .string()
  .min(passwordPolicy.minLength)
  .max(passwordPolicy.maxLength)
  .superRefine((password, context) => {
    for (const message of validatePasswordPolicy(password)) {
      context.addIssue({ code: "custom", message });
    }
  });

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Enter a display name.").max(80),
  email: z.email("Enter a valid email address.").trim().max(254),
  password: passwordSchema,
  terms: z.literal("on", {
    error: "Confirm that you agree to the marketplace rules.",
  }),
  returnTo: z.string().optional().transform(normalizeReturnTo),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(254),
  password: z.string().min(1, "Enter your password.").max(passwordPolicy.maxLength),
  returnTo: z.string().optional().transform(normalizeReturnTo),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: passwordSchema,
});

export const resendVerificationSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(254),
});
