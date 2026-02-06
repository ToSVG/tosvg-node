/**
 * Configuration options for the ToSVG client.
 */
export interface ClientOptions {
  /**
   * API base URL.
   * @default 'https://tosvg.com/api/v1'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Automatically retry on 429 (rate limit) responses.
   * @default true
   */
  retryOnRateLimit?: boolean;

  /**
   * Maximum number of retry attempts on rate limit.
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Resolved client options with all defaults applied.
 */
export interface ResolvedClientOptions {
  baseUrl: string;
  timeout: number;
  retryOnRateLimit: boolean;
  maxRetries: number;
}

/**
 * Rate limit information parsed from response headers.
 */
export interface RateLimitInfo {
  /** Maximum requests allowed in the current period. */
  limit: number;
  /** Remaining requests in the current period. */
  remaining: number;
  /** Date when the rate limit resets. */
  resetAt: Date;
}

/**
 * Default client options.
 */
export const DEFAULT_CLIENT_OPTIONS: ResolvedClientOptions = {
  baseUrl: 'https://tosvg.com/api/v1',
  timeout: 30_000,
  retryOnRateLimit: true,
  maxRetries: 3,
};
