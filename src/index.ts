// ─── Client ────────────────────────────────────────────────────
export { ToSVGClient } from './client.js';

// ─── Types ─────────────────────────────────────────────────────
export type {
  // Client
  ClientOptions,
  RateLimitInfo,

  // Common
  FileInput,

  // Convert
  ImageToSvgOptions,
  ImageToSvgResult,

  // Background
  RemoveBackgroundOptions,
  RemoveBackgroundResult,
  RemoveBackgroundFileResult,
  RemoveBackgroundBase64Result,

  // Resize
  ResizeImageOptions,
  ResizeImageResult,

  // Info
  HealthCheckResult,
  SupportedFormatsResult,
  BackgroundModelsResult,
  ResizeLimitsResult,
  ApiInfoResult,
  FormatInfo,
} from './types/index.js';

// ─── Errors ────────────────────────────────────────────────────
export {
  ToSVGError,
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  RateLimitError,
  BadRequestError,
  ServerError,
  NetworkError,
} from './errors/index.js';
