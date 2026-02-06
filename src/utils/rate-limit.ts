import type { RateLimitInfo } from '../types/client.js';

/**
 * Parses rate limit information from response headers.
 *
 * Expected headers:
 * - `X-RateLimit-Limit` — Maximum requests allowed.
 * - `X-RateLimit-Remaining` — Remaining requests in the current period.
 * - `X-RateLimit-Reset` — Unix timestamp when the limit resets.
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (limit === null || remaining === null || reset === null) {
    return null;
  }

  const limitNum = parseInt(limit, 10);
  const remainingNum = parseInt(remaining, 10);
  const resetNum = parseInt(reset, 10);

  if (isNaN(limitNum) || isNaN(remainingNum) || isNaN(resetNum)) {
    return null;
  }

  return {
    limit: limitNum,
    remaining: remainingNum,
    resetAt: new Date(resetNum * 1000),
  };
}
