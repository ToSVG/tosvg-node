// Client types
export type {
  ClientOptions,
  ResolvedClientOptions,
  RateLimitInfo,
} from './client.js';
export { DEFAULT_CLIENT_OPTIONS } from './client.js';

// Common types
export type {
  FileInput,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  HttpMethod,
} from './common.js';

// Convert types
export type { ImageToSvgOptions, ImageToSvgResult } from './convert.js';

// Background types
export type {
  RemoveBackgroundOptions,
  RemoveBackgroundResult,
  RemoveBackgroundFileResult,
  RemoveBackgroundBase64Result,
} from './background.js';

// Resize types
export type { ResizeImageOptions, ResizeImageResult } from './resize.js';

// Info types
export type {
  HealthCheckResult,
  FormatInfo,
  SupportedFormatsResult,
  BackgroundModelsResult,
  ResizeLimitsResult,
  ApiInfoResult,
} from './info.js';
