import type {
  HealthCheckResult,
  SupportedFormatsResult,
  BackgroundModelsResult,
  ResizeLimitsResult,
} from '../types/info.js';
import type { HttpClient } from '../utils/http-client.js';

/**
 * Handles informational / read-only API endpoints.
 */
export class InfoResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Checks the health status of all ToSVG services.
   * Does not require authentication.
   *
   * @returns Service health status and per-service operational state.
   *
   * @example
   * ```ts
   * const health = await client.healthCheck();
   * console.log(health.status); // 'healthy'
   * console.log(health.services); // { image_conversion: 'operational', ... }
   * ```
   */
  async healthCheck(): Promise<HealthCheckResult> {
    // Health endpoint returns { success, status, timestamp, services }
    // not wrapped in data, so we need to handle it differently
    return this.http.get<HealthCheckResult>('/health');
  }

  /**
   * Returns the list of supported input image formats.
   * Requires authentication.
   *
   * @returns Supported formats with max sizes and descriptions.
   */
  async getSupportedFormats(): Promise<SupportedFormatsResult> {
    const data = await this.http.get<{
      formats: Record<string, { max_size: string; description: string }>;
      max_dimensions: string;
      max_file_size: string;
    }>('/convert/supported-formats');

    return {
      formats: data.formats,
      maxDimensions: data.max_dimensions,
      maxFileSize: data.max_file_size,
    };
  }

  /**
   * Returns the available AI models for background removal.
   * Requires authentication.
   *
   * @param provider - Optional provider filter (e.g. `'rembg'`).
   * @returns Available models and providers.
   */
  async getModels(provider?: string): Promise<BackgroundModelsResult> {
    const query = provider ? { provider } : undefined;

    const data = await this.http.get<{
      provider: string;
      models: string[];
      available_providers: string[];
      default_provider: string;
      supported_formats: string[];
    }>('/background/models', query);

    return {
      provider: data.provider,
      models: data.models,
      availableProviders: data.available_providers,
      defaultProvider: data.default_provider,
      supportedFormats: data.supported_formats,
    };
  }

  /**
   * Returns the resize dimension and quality limits.
   * Requires authentication.
   *
   * @returns Min/max dimensions, quality range, and supported formats.
   */
  async getResizeLimits(): Promise<ResizeLimitsResult> {
    const data = await this.http.get<{
      max_dimensions: { width: number; height: number };
      min_dimensions: { width: number; height: number };
      max_file_size: string;
      supported_formats: string[];
      quality_range: { min: number; max: number; default: number };
    }>('/resize/limits');

    return {
      maxDimensions: data.max_dimensions,
      minDimensions: data.min_dimensions,
      maxFileSize: data.max_file_size,
      supportedFormats: data.supported_formats,
      qualityRange: data.quality_range,
    };
  }
}
