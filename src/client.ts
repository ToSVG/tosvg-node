import type {
  ClientOptions,
  ResolvedClientOptions,
  RateLimitInfo,
} from './types/client.js';
import { DEFAULT_CLIENT_OPTIONS } from './types/client.js';
import type { FileInput } from './types/common.js';
import type { ImageToSvgOptions, ImageToSvgResult } from './types/convert.js';
import type {
  RemoveBackgroundOptions,
  RemoveBackgroundResult,
} from './types/background.js';
import type { ResizeImageOptions, ResizeImageResult } from './types/resize.js';
import type {
  HealthCheckResult,
  SupportedFormatsResult,
  BackgroundModelsResult,
  ResizeLimitsResult,
} from './types/info.js';
import { HttpClient } from './utils/http-client.js';
import { ConvertResource } from './resources/convert.js';
import { BackgroundResource } from './resources/background.js';
import { ResizeResource } from './resources/resize.js';
import { InfoResource } from './resources/info.js';

/**
 * ToSVG API client.
 *
 * Provides methods for image-to-SVG conversion, background removal,
 * image resizing, and API information queries.
 *
 * @example
 * ```ts
 * import { ToSVGClient } from 'tosvg-api';
 *
 * const client = new ToSVGClient('tosvg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
 *
 * // Convert an image to SVG
 * const result = await client.imageToSvg('./photo.png');
 * console.log(result.svg);
 *
 * // Remove background
 * const bg = await client.removeBackground('./photo.png', { returnBase64: true });
 *
 * // Resize image
 * const resized = await client.resizeImage('./photo.png', { width: 800, height: 600 });
 * ```
 */
export class ToSVGClient {
  private readonly http: HttpClient;
  private readonly convert: ConvertResource;
  private readonly background: BackgroundResource;
  private readonly resize: ResizeResource;
  private readonly info: InfoResource;

  /**
   * Creates a new ToSVG API client.
   *
   * @param apiKey - Your ToSVG API key (starts with `tosvg_live_` or `tosvg_test_`).
   * @param options - Optional client configuration.
   * @throws {Error} If the API key is not provided.
   */
  constructor(apiKey: string, options?: ClientOptions) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error(
        'API key is required. Get your key at https://tosvg.com/dashboard',
      );
    }

    const resolvedOptions: ResolvedClientOptions = {
      ...DEFAULT_CLIENT_OPTIONS,
      ...options,
    };

    // Ensure baseUrl does not have a trailing slash
    resolvedOptions.baseUrl = resolvedOptions.baseUrl.replace(/\/+$/, '');

    this.http = new HttpClient(apiKey, resolvedOptions);
    this.convert = new ConvertResource(this.http);
    this.background = new BackgroundResource(this.http);
    this.resize = new ResizeResource(this.http);
    this.info = new InfoResource(this.http);
  }

  // ─── Core Methods ────────────────────────────────────────────

  /**
   * Converts a raster image to SVG format.
   *
   * @param image - Image file (file path, Buffer, or ReadStream).
   * @param options - Conversion options (colorMode, mode, filterSpeckle, etc.).
   * @returns SVG content and metadata.
   */
  async imageToSvg(
    image: FileInput,
    options?: ImageToSvgOptions,
  ): Promise<ImageToSvgResult> {
    return this.convert.imageToSvg(image, options);
  }

  /**
   * Removes the background from an image using AI models.
   *
   * @param image - Image file (file path, Buffer, or ReadStream).
   * @param options - Background removal options (provider, model, format, returnBase64).
   * @returns Processed image data (file path or base64).
   */
  async removeBackground(
    image: FileInput,
    options?: RemoveBackgroundOptions,
  ): Promise<RemoveBackgroundResult> {
    return this.background.removeBackground(image, options);
  }

  /**
   * Resizes an image to the specified dimensions.
   *
   * @param image - Image file (file path, Buffer, or ReadStream).
   * @param options - Resize options (width and height are required).
   * @returns Resized image metadata.
   */
  async resizeImage(
    image: FileInput,
    options: ResizeImageOptions,
  ): Promise<ResizeImageResult> {
    return this.resize.resizeImage(image, options);
  }

  // ─── Info Methods ────────────────────────────────────────────

  /**
   * Checks the health status of all ToSVG services.
   */
  async healthCheck(): Promise<HealthCheckResult> {
    return this.info.healthCheck();
  }

  /**
   * Returns the list of supported input image formats.
   */
  async getSupportedFormats(): Promise<SupportedFormatsResult> {
    return this.info.getSupportedFormats();
  }

  /**
   * Returns the available AI models for background removal.
   *
   * @param provider - Optional provider filter (e.g. `'rembg'`).
   */
  async getModels(provider?: string): Promise<BackgroundModelsResult> {
    return this.info.getModels(provider);
  }

  /**
   * Returns the resize dimension and quality limits.
   */
  async getResizeLimits(): Promise<ResizeLimitsResult> {
    return this.info.getResizeLimits();
  }

  // ─── Utilities ───────────────────────────────────────────────

  /**
   * Returns the current rate limit information from the last API response.
   * Returns `null` if no API call has been made yet.
   *
   * @returns Rate limit info with `limit`, `remaining`, and `resetAt`.
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.http.getRateLimitInfo();
  }
}
