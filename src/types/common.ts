import type { ReadStream } from 'node:fs';

/**
 * Accepted file input types for image upload.
 * - `string` — Absolute or relative file path; SDK reads the file automatically.
 * - `Buffer` — In-memory buffer (e.g. from `fs.readFileSync` or an HTTP response).
 * - `ReadStream` — Node.js readable stream from `fs.createReadStream()`.
 */
export type FileInput = string | Buffer | ReadStream;

/**
 * Base API success response envelope.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Base API error response envelope.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
  limit?: number;
  window?: number;
}

/**
 * Union of all API response shapes.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Supported HTTP methods for internal use.
 */
export type HttpMethod = 'GET' | 'POST';
