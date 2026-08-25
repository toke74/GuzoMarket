import { env } from "@/lib/config/env";

type AuthEmail = {
  to: string;
  type: "email_verification" | "password_reset";
  url: string;
  createdAt: Date;
};

const globalForAuthEmail = globalThis as unknown as {
  guzoMarketAuthEmailOutbox?: AuthEmail[];
};

export const devAuthEmailOutbox = globalForAuthEmail.guzoMarketAuthEmailOutbox ?? [];

if (process.env.NODE_ENV !== "production") {
  globalForAuthEmail.guzoMarketAuthEmailOutbox = devAuthEmailOutbox;
}

export async function sendEmailVerificationEmail(to: string, token: string) {
  await sendAuthEmail({
    to,
    type: "email_verification",
    url: buildAuthUrl("/auth/verify-email", token),
    createdAt: new Date(),
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  await sendAuthEmail({
    to,
    type: "password_reset",
    url: buildAuthUrl("/auth/reset-password", token),
    createdAt: new Date(),
  });
}

async function sendAuthEmail(email: AuthEmail) {
  if (env.AUTH_EMAIL_DELIVERY_MODE === "development") {
    devAuthEmailOutbox.push(email);
    return;
  }

  throw new Error("Auth email delivery is disabled.");
}

function buildAuthUrl(pathname: string, token: string) {
  const url = new URL(pathname, env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", token);
  return url.toString();
}
