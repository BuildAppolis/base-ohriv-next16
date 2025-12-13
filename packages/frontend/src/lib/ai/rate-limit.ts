// Optionally apply rate limiting - feel free to remove this if you don't want to configure upstash
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// If no Redis env is configured, return a no-op limiter so local/dev doesn’t 429
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const rateLimitDisabled =
  process.env.SKIP_RATE_LIMIT === "true" ||
  (!redisUrl && !redisToken);

const ratelimit = rateLimitDisabled
  ? null
  : new Ratelimit({
      redis: Redis.fromEnv(),
      // Allow 200 requests per minute per identifier by default; adjust as needed
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });

export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    return {
      success: true,
      limit: Infinity,
      reset: Date.now(),
      remaining: Infinity,
      headers: {},
    };
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier
  );

  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}
