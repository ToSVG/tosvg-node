import type { ResolvedClientOptions, RateLimitInfo } from '../types/client.js';
import type { ApiErrorResponse, HttpMethod } from '../types/common.js';
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
  NetworkError,
  RateLimitError,
  ServerError,
  ToSVGError,
  ValidationError,
} from '../errors/index.js';
import { parseRateLimitHeaders } from './rate-limit.js';
import { retryWithBackoff } from './retry.js';

/**
 * Internal HTTP client that handles:
 * - API key injection via `X-API-Key` header
 * - Request timeout via `AbortController`
 * - Response status → typed error mapping
 * - Rate limit header parsing
 * - Auto retry on 429 with exponential backoff
 */
export class HttpClient {
  private readonly apiKey: string;
  private readonly options: ResolvedClientOptions;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(apiKey: string, options: ResolvedClientOptions) {
    this.apiKey = apiKey;
    this.options = options;
  }

  /**
   * Returns the last known rate limit information.
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Performs a GET request.
   */
  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    let url = `${this.options.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }
    return this.request<T>('GET', url);
  }

  /**
   * Performs a POST request with `multipart/form-data`.
   */
  async post<T>(path: string, formData: FormData): Promise<T> {
    const url = `${this.options.baseUrl}${path}`;
    return this.request<T>('POST', url, formData);
  }

  /**
   * Core request method with retry, timeout, and error handling.
   */
  private async request<T>(
    method: HttpMethod,
    url: string,
    body?: FormData,
  ): Promise<T> {
    const execute = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.options.timeout,
      );

      try {
        const headers: Record<string, string> = {
          'X-API-Key': this.apiKey,
          Accept: 'application/json',
        };

        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });

        // Parse rate limit headers from every response
        const rateLimitInfo = parseRateLimitHeaders(response.headers);
        if (rateLimitInfo) {
          this.rateLimitInfo = rateLimitInfo;
        }

        // Handle error responses
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        // Parse successful response
        const json = (await response.json()) as { success: boolean; data?: T };
        return json.data as T;
      } catch (error) {
        if (error instanceof ToSVGError) {
          throw error;
        }

        // AbortController timeout
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          throw new NetworkError(
            `Request timed out after ${this.options.timeout}ms`,
            error,
          );
        }

        // Network errors (DNS, connection refused, etc.)
        if (error instanceof TypeError) {
          throw new NetworkError(
            `Network error: ${(error as Error).message}`,
            error,
          );
        }

        throw new NetworkError(
          `Unexpected error: ${(error as Error).message}`,
          error as Error,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Wrap with retry logic
    return retryWithBackoff(execute, {
      maxRetries: this.options.maxRetries,
      retryOnRateLimit: this.options.retryOnRateLimit,
    });
  }

  /**
   * Maps HTTP error status codes to typed SDK errors.
   * Priority: 401 → 403 → 429 → 422 → 400 → 500
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let body: ApiErrorResponse;

    try {
      body = (await response.json()) as ApiErrorResponse;
    } catch {
      body = {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const message = body.message || `HTTP ${response.status}`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, undefined, body);

      case 403:
        throw new ForbiddenError(message, undefined, body);

      case 429: {
        const retryAfter =
          body.retry_after ||
          parseInt(response.headers.get('Retry-After') || '60', 10);
        throw new RateLimitError(message, retryAfter, body);
      }

      case 422:
        throw new ValidationError(message, body.errors || {}, body);

      case 400:
        throw new BadRequestError(message, undefined, body);

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message, undefined, body);

      default:
        throw new ToSVGError(message, response.status, undefined, body);
    }
  }
}
