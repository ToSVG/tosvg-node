/**
 * Options for background removal.
 */
export interface RemoveBackgroundOptions {
  /**
   * Background removal provider.
   * - `'rembg'` — Default provider, supports model selection.
   * - `'withoutbg'` — Alternative provider.
   * @default 'rembg'
   */
  provider?: 'rembg' | 'withoutbg';

  /**
   * AI model to use (only with `provider: 'rembg'`).
   * - `'u2net'` — General purpose (default).
   * - `'silueta'` — Fast, lightweight model.
   * - `'u2net_human_seg'` — Optimized for human segmentation.
   * - `'isnet-general-use'` — General use, high accuracy.
   * @default 'u2net'
   */
  model?: 'u2net' | 'silueta' | 'u2net_human_seg' | 'isnet-general-use';

  /**
   * Output format.
   * @default 'png'
   */
  format?: 'png' | 'jpg' | 'jpeg';

  /**
   * Return the result as a base64-encoded string instead of a file path.
   * @default false
   */
  returnBase64?: boolean;
}

/**
 * Result when `returnBase64` is `false` (default).
 */
export interface RemoveBackgroundFileResult {
  /** Generated filename (UUID-based). */
  filename: string;
  /** Storage-relative file path. */
  path: string;
  /** File size in bytes. */
  fileSize: number;
  /** Processing time in seconds. */
  processingTime: number;
  /** Provider used for background removal. */
  provider: string;
}

/**
 * Result when `returnBase64` is `true`.
 */
export interface RemoveBackgroundBase64Result {
  /** Base64-encoded image data. */
  image: string;
  /** Output format. */
  format: string;
  /** File size in bytes. */
  fileSize: number;
  /** Processing time in seconds. */
  processingTime: number;
  /** Provider used for background removal. */
  provider: string;
}

/**
 * Union result type for background removal.
 */
export type RemoveBackgroundResult =
  | RemoveBackgroundFileResult
  | RemoveBackgroundBase64Result;
