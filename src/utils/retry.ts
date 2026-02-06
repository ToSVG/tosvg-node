import { RateLimitError } from '../errors/index.js';

/**
 * Configuration for the retry mechanism.
 */
export interface RetryConfig {
  /** Maximum number of retries. */
  maxRetries: number;
  /** Whether to retry on rate limit (429) responses. */
  retryOnRateLimit: boolean;
}

/**
 * Executes an async operation with automatic retry on rate limit errors.
 * Uses exponential backoff with the `Retry-After` header value.
 *
 * @param fn - The async operation to execute.
 * @param config - Retry configuration.
 * @returns The result of the operation.
 * @throws The last error if all retries are exhausted.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Only retry on rate limit errors when enabled
      if (
        !config.retryOnRateLimit ||
        !(error instanceof RateLimitError) ||
        attempt >= config.maxRetries
      ) {
        throw error;
      }

      // Wait using retryAfter or exponential backoff
      const waitSeconds = error.retryAfter || Math.pow(2, attempt + 1);
      await sleep(waitSeconds * 1000);
    }
  }

  throw lastError;
}

/**
 * Sleeps for the specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
