import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | GuzoMarket",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email. The response is intentionally neutral for account security."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
