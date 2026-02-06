/**
 * Options for image-to-SVG conversion.
 */
export interface ImageToSvgOptions {
  /**
   * Color mode for the output SVG.
   * - `'color'` — Full color SVG output.
   * - `'bw'` — Black and white SVG output.
   * @default 'color'
   */
  colorMode?: 'color' | 'bw';

  /**
   * Conversion algorithm.
   * - `'polygon'` — Sharp-edged polygon-based conversion.
   * - `'spline'` — Smooth curved spline-based conversion.
   * @default 'polygon'
   */
  mode?: 'polygon' | 'spline';

  /**
   * Noise filter size. Higher values remove more speckles.
   * @min 0
   * @max 20
   * @default 8
   */
  filterSpeckle?: number;

  /**
   * Corner threshold angle in degrees.
   * @min 0
   * @max 180
   * @default 30
   */
  cornerThreshold?: number;

  /**
   * Color precision level. Higher values produce more colors.
   * @min 1
   * @max 10
   * @default 4
   */
  colorPrecision?: number;
}

/**
 * Result of an image-to-SVG conversion.
 */
export interface ImageToSvgResult {
  /** Raw SVG content (XML string). */
  svg: string;
  /** SVG file size in bytes. */
  fileSize: number;
  /** Conversion time in seconds. */
  conversionTime: number;
}
