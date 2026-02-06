import type { FileInput } from '../types/common.js';
import type {
  ResizeImageOptions,
  ResizeImageResult,
} from '../types/resize.js';
import type { HttpClient } from '../utils/http-client.js';
import { resolveFileInputAsync } from '../utils/file-input.js';

/**
 * Handles image resize operations.
 */
export class ResizeResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Resizes an image to the specified dimensions.
   *
   * @param image - Image file as a file path, Buffer, or ReadStream.
   * @param options - Resize options (width and height are required).
   * @returns The resized image metadata.
   *
   * @example
   * ```ts
   * const result = await client.resizeImage('./photo.png', {
   *   width: 800,
   *   height: 600,
   *   format: 'webp',
   *   quality: 80,
   * });
   * console.log(result.dimensions); // { width: 800, height: 600 }
   * ```
   */
  async resizeImage(
    image: FileInput,
    options: ResizeImageOptions,
  ): Promise<ResizeImageResult> {
    const { blob, filename } = await resolveFileInputAsync(image);
    const formData = new FormData();
    formData.append('image', blob, filename);

    // Required parameters
    formData.append('width', String(options.width));
    formData.append('height', String(options.height));

    // Optional parameters (camelCase → snake_case)
    if (options.quality !== undefined) {
      formData.append('quality', String(options.quality));
    }
    if (options.format !== undefined) {
      formData.append('format', options.format);
    }
    if (options.maintainAspectRatio !== undefined) {
      formData.append(
        'maintain_aspect_ratio',
        String(options.maintainAspectRatio),
      );
    }

    const data = await this.http.post<{
      path: string;
      size: number;
      dimensions: { width: number; height: number };
      quality: number;
      format: string;
      processing_time: number;
    }>('/resize/image', formData);

    return {
      path: data.path,
      size: data.size,
      dimensions: data.dimensions,
      quality: data.quality,
      format: data.format,
      processingTime: data.processing_time,
    };
  }
}
