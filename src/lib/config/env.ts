import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  AUTH_SESSION_SECRET: z
    .string()
    .min(32)
    .default(
      process.env.NODE_ENV === "production"
        ? ""
        : "development-only-guzomarket-session-secret",
    ),
  AUTH_EMAIL_DELIVERY_MODE: z.enum(["development", "disabled"]).default("development"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
  AUTH_EMAIL_DELIVERY_MODE: process.env.AUTH_EMAIL_DELIVERY_MODE,
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
