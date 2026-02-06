import type { FileInput } from '../types/common.js';
import type {
  RemoveBackgroundOptions,
  RemoveBackgroundResult,
} from '../types/background.js';
import type { HttpClient } from '../utils/http-client.js';
import { resolveFileInputAsync } from '../utils/file-input.js';

/**
 * Handles background removal operations.
 */
export class BackgroundResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Removes the background from an image using AI models.
   *
   * @param image - Image file as a file path, Buffer, or ReadStream.
   * @param options - Background removal options.
   * @returns The processed image data (file path or base64).
   *
   * @example
   * ```ts
   * // Get file path
   * const result = await client.removeBackground('./photo.png');
   * console.log(result.path);
   *
   * // Get base64
   * const result = await client.removeBackground('./photo.png', { returnBase64: true });
   * console.log(result.image); // base64 string
   * ```
   */
  async removeBackground(
    image: FileInput,
    options?: RemoveBackgroundOptions,
  ): Promise<RemoveBackgroundResult> {
    const { blob, filename } = await resolveFileInputAsync(image);
    const formData = new FormData();
    formData.append('image', blob, filename);

    // Map camelCase options to API snake_case format
    if (options?.provider !== undefined) {
      formData.append('provider', options.provider);
    }
    if (options?.model !== undefined) {
      formData.append('model', options.model);
    }
    if (options?.format !== undefined) {
      formData.append('format', options.format);
    }
    if (options?.returnBase64 !== undefined) {
      formData.append('return_base64', String(options.returnBase64));
    }

    const data = await this.http.post<Record<string, unknown>>(
      '/background/remove',
      formData,
    );

    // Map snake_case response to camelCase
    if (options?.returnBase64) {
      return {
        image: data['image'] as string,
        format: data['format'] as string,
        fileSize: data['file_size'] as number,
        processingTime: data['processing_time'] as number,
        provider: data['provider'] as string,
      };
    }

    return {
      filename: data['filename'] as string,
      path: data['path'] as string,
      fileSize: data['file_size'] as number,
      processingTime: data['processing_time'] as number,
      provider: data['provider'] as string,
    };
  }
}
