type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: Date;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit({
  key,
  limit,
  windowMs,
  now = new Date(),
}: RateLimitOptions): RateLimitResult {
  const nowMs = now.getTime();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= nowMs) {
    buckets.set(key, { count: 1, resetAt: nowMs + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - nowMs) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

export function resetRateLimitsForTests() {
  buckets.clear();
}
