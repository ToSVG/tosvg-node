import type { FileInput } from '../types/common.js';
import type { ImageToSvgOptions, ImageToSvgResult } from '../types/convert.js';
import type { HttpClient } from '../utils/http-client.js';
import { resolveFileInputAsync } from '../utils/file-input.js';

/**
 * Handles image-to-SVG conversion operations.
 */
export class ConvertResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Converts a raster image to SVG format.
   *
   * @param image - Image file as a file path, Buffer, or ReadStream.
   * @param options - Conversion options.
   * @returns The SVG content and metadata.
   *
   * @example
   * ```ts
   * const result = await client.imageToSvg('./photo.png');
   * console.log(result.svg); // <svg xmlns="...">...</svg>
   * ```
   */
  async imageToSvg(
    image: FileInput,
    options?: ImageToSvgOptions,
  ): Promise<ImageToSvgResult> {
    const { blob, filename } = await resolveFileInputAsync(image);
    const formData = new FormData();
    formData.append('image', blob, filename);

    // Map camelCase options to API snake_case format
    if (options?.colorMode !== undefined) {
      formData.append('options[color_mode]', options.colorMode);
    }
    if (options?.mode !== undefined) {
      formData.append('options[mode]', options.mode);
    }
    if (options?.filterSpeckle !== undefined) {
      formData.append(
        'options[filter_speckle]',
        String(options.filterSpeckle),
      );
    }
    if (options?.cornerThreshold !== undefined) {
      formData.append(
        'options[corner_threshold]',
        String(options.cornerThreshold),
      );
    }
    if (options?.colorPrecision !== undefined) {
      formData.append(
        'options[color_precision]',
        String(options.colorPrecision),
      );
    }

    const data = await this.http.post<{
      svg: string;
      file_size: number;
      conversion_time: number;
    }>('/convert/image-to-svg', formData);

    return {
      svg: data.svg,
      fileSize: data.file_size,
      conversionTime: data.conversion_time,
    };
  }
}
