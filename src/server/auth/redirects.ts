const authRoutes = new Set([
  "/auth/sign-up",
  "/auth/log-in",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

export function normalizeReturnTo(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const parsed = new URL(value, "http://guzomarket.local");

    if (parsed.origin !== "http://guzomarket.local") {
      return "/";
    }

    if (authRoutes.has(parsed.pathname)) {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export function buildLoginPath(returnTo: string) {
  const safeReturnTo = normalizeReturnTo(returnTo);
  const params = new URLSearchParams();

  if (safeReturnTo !== "/") {
    params.set("returnTo", safeReturnTo);
  }

  const query = params.toString();
  return query ? `/auth/log-in?${query}` : "/auth/log-in";
}
