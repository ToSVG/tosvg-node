/**
 * Response from the health check endpoint.
 */
export interface HealthCheckResult {
  /** Overall service status. */
  status: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Per-service operational status. */
  services: Record<string, string>;
}

/**
 * Format details returned by the supported formats endpoint.
 */
export interface FormatInfo {
  /** Maximum allowed file size (e.g. "10MB"). */
  max_size: string;
  /** Human-readable description. */
  description: string;
}

/**
 * Response from the supported formats endpoint.
 */
export interface SupportedFormatsResult {
  /** Map of format extension to format details. */
  formats: Record<string, FormatInfo>;
  /** Maximum allowed dimensions (e.g. "4096x4096 pixels"). */
  maxDimensions: string;
  /** Maximum allowed file size (e.g. "10MB"). */
  maxFileSize: string;
}

/**
 * Response from the background removal models endpoint.
 */
export interface BackgroundModelsResult {
  /** Current provider. */
  provider: string;
  /** Available models for the current provider. */
  models: string[];
  /** All available providers. */
  availableProviders: string[];
  /** Default provider name. */
  defaultProvider: string;
  /** Supported output formats. */
  supportedFormats: string[];
}

/**
 * Response from the resize limits endpoint.
 */
export interface ResizeLimitsResult {
  /** Maximum allowed dimensions. */
  maxDimensions: {
    width: number;
    height: number;
  };
  /** Minimum allowed dimensions. */
  minDimensions: {
    width: number;
    height: number;
  };
  /** Maximum file size (e.g. "10MB"). */
  maxFileSize: string;
  /** Supported output formats. */
  supportedFormats: string[];
  /** Quality range configuration. */
  qualityRange: {
    min: number;
    max: number;
    default: number;
  };
}

/**
 * Response from the API info endpoint.
 */
export interface ApiInfoResult {
  message: string;
  version: string;
  baseUrl: string;
  documentation: string;
  endpoints: Record<string, unknown>;
  rateLimits: Record<string, string>;
}
