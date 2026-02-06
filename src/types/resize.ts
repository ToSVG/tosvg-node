/**
 * Options for image resizing.
 */
export interface ResizeImageOptions {
  /**
   * Target width in pixels.
   * @min 1
   * @max 4096
   */
  width: number;

  /**
   * Target height in pixels.
   * @min 1
   * @max 4096
   */
  height: number;

  /**
   * Output quality (1–100).
   * @default 90
   */
  quality?: number;

  /**
   * Output format.
   * @default 'png'
   */
  format?: 'png' | 'jpg' | 'jpeg' | 'webp';

  /**
   * Whether to maintain the original aspect ratio.
   * @default true
   */
  maintainAspectRatio?: boolean;
}

/**
 * Result of an image resize operation.
 */
export interface ResizeImageResult {
  /** Storage-relative path to the resized image. */
  path: string;
  /** File size in bytes. */
  size: number;
  /** Output dimensions. */
  dimensions: {
    width: number;
    height: number;
  };
  /** Quality value used. */
  quality: number;
  /** Output format. */
  format: string;
  /** Processing time in seconds. */
  processingTime: number;
}
