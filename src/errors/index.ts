import type { ApiErrorResponse } from '../types/common.js';

/**
 * Base error class for all ToSVG SDK errors.
 */
export class ToSVGError extends Error {
  /** HTTP status code (if applicable). */
  readonly statusCode?: number;
  /** API error code (e.g. `INVALID_API_KEY`, `RATE_LIMIT_EXCEEDED`). */
  readonly code?: string;
  /** Raw API error response body. */
  readonly response?: ApiErrorResponse;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    response?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ToSVGError';
    this.statusCode = statusCode;
    this.code = code;
    this.response = response;
  }
}

/**
 * Thrown when authentication fails (HTTP 401).
 * Possible codes: `MISSING_API_KEY`, `INVALID_API_KEY`, `EXPIRED_API_KEY`, `INACTIVE_API_KEY`.
 */
export class AuthenticationError extends ToSVGError {
  constructor(message: string, code?: string, response?: ApiErrorResponse) {
    super(message, 401, code, response);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when access is forbidden (HTTP 403).
 * Possible codes: `IP_RESTRICTED`, `SUBSCRIPTION_REQUIRED`.
 */
export class ForbiddenError extends ToSVGError {
  constructor(message: string, code?: string, response?: ApiErrorResponse) {
    super(message, 403, code, response);
    this.name = 'ForbiddenError';
  }
}

/**
 * Thrown when request validation fails (HTTP 422).
 * Contains field-level validation errors in the `errors` property.
 */
export class ValidationError extends ToSVGError {
  /** Field-level validation errors. */
  readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    errors: Record<string, string[]>,
    response?: ApiErrorResponse,
  ) {
    super(message, 422, 'VALIDATION_ERROR', response);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Thrown when the rate limit is exceeded (HTTP 429).
 * Contains the number of seconds to wait before retrying.
 */
export class RateLimitError extends ToSVGError {
  /** Seconds to wait before retrying. */
  readonly retryAfter: number;

  constructor(
    message: string,
    retryAfter: number,
    response?: ApiErrorResponse,
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown on bad request (HTTP 400).
 * Possible codes: `VALIDATION_ERROR`, `UNSUPPORTED_FORMAT`, `FILE_TOO_LARGE`.
 */
export class BadRequestError extends ToSVGError {
  constructor(message: string, code?: string, response?: ApiErrorResponse) {
    super(message, 400, code, response);
    this.name = 'BadRequestError';
  }
}

/**
 * Thrown on internal server error (HTTP 500).
 * Possible codes: `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`.
 */
export class ServerError extends ToSVGError {
  constructor(message: string, code?: string, response?: ApiErrorResponse) {
    super(message, 500, code, response);
    this.name = 'ServerError';
  }
}

/**
 * Thrown when a network error occurs (connection failure, DNS, timeout).
 * Does not have an HTTP status code.
 */
export class NetworkError extends ToSVGError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    if (cause) {
      this.cause = cause;
    }
  }
}
