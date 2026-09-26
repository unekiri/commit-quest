import type { MiddlewareHandler } from "hono";
import { AppError } from "../lib/errors";

/**
 * Applies the Workers Rate Limiting binding (`API_RATE_LIMITER`, see
 * wrangler.jsonc) per client IP to every `/api/*` request, so a burst of
 * requests against this publicly reachable Worker cannot exhaust the
 * GitHub token / rate limit it holds server-side.
 *
 * Note: Rate Limiting bindings count requests per Cloudflare location as an
 * approximation, not a globally exact counter (see Cloudflare docs), so the
 * effective limit can be looser than 60 req/min under distributed traffic.
 */
export const rateLimitMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // CF-Connecting-IP is absent outside Cloudflare's network (e.g. some local
  // dev setups); fall back to a fixed key so those requests still share one
  // rate-limit bucket instead of bypassing the limit entirely.
  const key = c.req.header("CF-Connecting-IP") ?? "unknown";
  const { success } = await c.env.API_RATE_LIMITER.limit({ key });
  if (!success) {
    throw new AppError(
      "TOO_MANY_REQUESTS",
      429,
      "Too many requests. Please wait a moment and try again.",
    );
  }
  await next();
};
