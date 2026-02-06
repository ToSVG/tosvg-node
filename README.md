# tosvg-api

> Official Node.js SDK for the [ToSVG API](https://tosvg.com) — Image to SVG conversion, background removal, and image resizing.

[![npm version](https://img.shields.io/npm/v/tosvg-api.svg)](https://www.npmjs.com/package/tosvg-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

```ts
import { ToSVGClient } from "tosvg-api";

const client = new ToSVGClient("tosvg_live_your_api_key");
const result = await client.imageToSvg("./photo.png");
// result.svg → <svg xmlns="http://www.w3.org/2000/svg">...</svg>
```

---

## Features

- **TypeScript-first** — Full type definitions for all methods, options, and responses
- **Zero dependencies** — Uses native `fetch` and `FormData` (Node 18+)
- **Flexible file input** — Pass a file path (`string`), `Buffer`, or `ReadStream`
- **Auto retry** — Automatic retry on rate limit (429) with exponential backoff
- **Typed errors** — 7 specific error classes for precise error handling
- **Rate limit aware** — Parse rate limit headers and query remaining quota
- **Dual output** — ESM and CommonJS builds included

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Client Configuration](#client-configuration)
- [File Input Types](#file-input-types)
- [Core Methods](#core-methods)
  - [imageToSvg()](#imagetosvg)
  - [removeBackground()](#removebackground)
  - [resizeImage()](#resizeimage)
- [Info Methods](#info-methods)
  - [healthCheck()](#healthcheck)
  - [getSupportedFormats()](#getsupportedformats)
  - [getModels()](#getmodels)
  - [getResizeLimits()](#getresizelimits)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)
- [Examples](#examples)
- [License](#license)

---

## Installation

```bash
npm install tosvg-api
```

```bash
# or with yarn
yarn add tosvg-api

# or with pnpm
pnpm add tosvg-api
```

> **Requires Node.js 18 or later.** TypeScript type definitions are included — no `@types/` package needed.

---

## Quick Start

```ts
import { ToSVGClient } from "tosvg-api";

const client = new ToSVGClient("tosvg_live_your_api_key");

// Convert image to SVG
const result = await client.imageToSvg("./photo.png");
console.log(result.svg); // SVG XML string
console.log(result.fileSize); // SVG size in bytes

// Remove background
const bg = await client.removeBackground("./photo.png", {
  returnBase64: true,
});
console.log(bg.image); // base64 encoded image

// Resize image
const resized = await client.resizeImage("./photo.png", {
  width: 800,
  height: 600,
});
console.log(resized.dimensions); // { width: 800, height: 600 }
```

---

## Authentication

Get your API key from the [ToSVG Dashboard](https://tosvg.com/dashboard).

API keys use the format:

- **Production:** `tosvg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Sandbox:** `tosvg_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

```ts
// Direct
const client = new ToSVGClient("tosvg_live_your_api_key");

// From environment variable (recommended)
const client = new ToSVGClient(process.env.TOSVG_API_KEY!);
```

The SDK automatically sends the key via the `X-API-Key` header with every request.

---

## Client Configuration

```ts
const client = new ToSVGClient("tosvg_live_your_api_key", {
  baseUrl: "https://tosvg.com/api/v1", // API base URL
  timeout: 30000, // Request timeout (ms)
  retryOnRateLimit: true, // Auto-retry on 429
  maxRetries: 3, // Max retry attempts
});
```

| Option             | Type      | Default                    | Description                          |
| ------------------ | --------- | -------------------------- | ------------------------------------ |
| `baseUrl`          | `string`  | `https://tosvg.com/api/v1` | API base URL                         |
| `timeout`          | `number`  | `30000`                    | Request timeout in milliseconds      |
| `retryOnRateLimit` | `boolean` | `true`                     | Automatically retry on 429 responses |
| `maxRetries`       | `number`  | `3`                        | Maximum number of retry attempts     |

---

## File Input Types

All core methods accept three types of file input:

### File Path (string)

```ts
const result = await client.imageToSvg("./images/photo.png");
```

### Buffer

```ts
import { readFileSync } from "node:fs";

const buffer = readFileSync("./images/photo.png");
const result = await client.imageToSvg(buffer);
```

### ReadStream

```ts
import { createReadStream } from "node:fs";

const stream = createReadStream("./images/photo.png");
const result = await client.imageToSvg(stream);
```

**Supported formats:** PNG, JPEG, BMP, GIF, TIFF, WebP (max 10 MB, max 4096×4096 px)

---

## Core Methods

### `imageToSvg()`

Converts a raster image to SVG format.

```ts
const result = await client.imageToSvg(image, options?);
```

#### Options

| Option            | Type                      | Default     | Description                  |
| ----------------- | ------------------------- | ----------- | ---------------------------- |
| `colorMode`       | `'color'` \| `'bw'`       | `'color'`   | Color or black-and-white     |
| `mode`            | `'polygon'` \| `'spline'` | `'polygon'` | Conversion algorithm         |
| `filterSpeckle`   | `number` (0–20)           | `8`         | Noise filter size            |
| `cornerThreshold` | `number` (0–180)          | `30`        | Corner threshold angle (deg) |
| `colorPrecision`  | `number` (1–10)           | `4`         | Color precision level        |

#### Response

| Field            | Type     | Description               |
| ---------------- | -------- | ------------------------- |
| `svg`            | `string` | Raw SVG content (XML)     |
| `fileSize`       | `number` | SVG file size in bytes    |
| `conversionTime` | `number` | Conversion time (seconds) |

#### Example

```ts
// Black & white, spline mode
const result = await client.imageToSvg("./logo.png", {
  colorMode: "bw",
  mode: "spline",
  colorPrecision: 8,
});

// Write SVG to file
import { writeFileSync } from "node:fs";
writeFileSync("./logo.svg", result.svg);
```

---

### `removeBackground()`

Removes the background from an image using AI models.

```ts
const result = await client.removeBackground(image, options?);
```

#### Options

| Option         | Type                                                                     | Default   | Description                        |
| -------------- | ------------------------------------------------------------------------ | --------- | ---------------------------------- |
| `provider`     | `'rembg'` \| `'withoutbg'`                                               | `'rembg'` | Background removal provider        |
| `model`        | `'u2net'` \| `'silueta'` \| `'u2net_human_seg'` \| `'isnet-general-use'` | `'u2net'` | AI model (only with `rembg`)       |
| `format`       | `'png'` \| `'jpg'` \| `'jpeg'`                                           | `'png'`   | Output format                      |
| `returnBase64` | `boolean`                                                                | `false`   | Return base64 instead of file path |

#### Response

When `returnBase64: false` (default):

| Field            | Type     | Description                |
| ---------------- | -------- | -------------------------- |
| `filename`       | `string` | Generated filename (UUID)  |
| `path`           | `string` | Storage-relative file path |
| `fileSize`       | `number` | File size in bytes         |
| `processingTime` | `number` | Processing time (seconds)  |
| `provider`       | `string` | Provider used              |

When `returnBase64: true`:

| Field            | Type     | Description               |
| ---------------- | -------- | ------------------------- |
| `image`          | `string` | Base64-encoded image data |
| `format`         | `string` | Output format             |
| `fileSize`       | `number` | File size in bytes        |
| `processingTime` | `number` | Processing time (seconds) |
| `provider`       | `string` | Provider used             |

#### Example

```ts
// Get base64 result with high-accuracy model
const result = await client.removeBackground("./portrait.jpg", {
  provider: "rembg",
  model: "isnet-general-use",
  returnBase64: true,
});

// Decode and save
import { writeFileSync } from "node:fs";
writeFileSync("./portrait-nobg.png", Buffer.from(result.image, "base64"));
```

---

### `resizeImage()`

Resizes an image to the specified dimensions.

```ts
const result = await client.resizeImage(image, options);
```

#### Options

| Option                | Type                                       | Default | Required | Description                |
| --------------------- | ------------------------------------------ | ------- | -------- | -------------------------- |
| `width`               | `number` (1–4096)                          | —       | ✅       | Target width in pixels     |
| `height`              | `number` (1–4096)                          | —       | ✅       | Target height in pixels    |
| `quality`             | `number` (1–100)                           | `90`    | ❌       | Output quality             |
| `format`              | `'png'` \| `'jpg'` \| `'jpeg'` \| `'webp'` | `'png'` | ❌       | Output format              |
| `maintainAspectRatio` | `boolean`                                  | `true`  | ❌       | Keep original aspect ratio |

#### Response

| Field            | Type                                | Description               |
| ---------------- | ----------------------------------- | ------------------------- |
| `path`           | `string`                            | Resized file path         |
| `size`           | `number`                            | File size in bytes        |
| `dimensions`     | `{ width: number, height: number }` | Output dimensions         |
| `quality`        | `number`                            | Quality value used        |
| `format`         | `string`                            | Output format             |
| `processingTime` | `number`                            | Processing time (seconds) |

#### Example

```ts
const result = await client.resizeImage("./photo.png", {
  width: 1200,
  height: 630,
  format: "webp",
  quality: 80,
  maintainAspectRatio: true,
});

console.log(result.dimensions); // { width: 1200, height: 630 }
console.log(result.size); // file size in bytes
```

---

## Info Methods

### `healthCheck()`

Checks the health of all ToSVG services. **No authentication required.**

```ts
const health = await client.healthCheck();
console.log(health.status); // 'healthy'
console.log(health.services); // { image_conversion: 'operational', ... }
```

### `getSupportedFormats()`

Returns supported input image formats. Requires authentication.

```ts
const formats = await client.getSupportedFormats();
console.log(formats.formats); // { png: { max_size: '10MB', ... }, ... }
console.log(formats.maxDimensions); // '4096x4096 pixels'
```

### `getModels()`

Returns available AI models for background removal. Requires authentication.

```ts
const models = await client.getModels();
console.log(models.models); // ['u2net', 'silueta', ...]
console.log(models.availableProviders); // ['rembg', 'withoutbg']

// Filter by provider
const rembgModels = await client.getModels("rembg");
```

### `getResizeLimits()`

Returns resize dimension and quality limits. Requires authentication.

```ts
const limits = await client.getResizeLimits();
console.log(limits.maxDimensions); // { width: 4096, height: 4096 }
console.log(limits.qualityRange); // { min: 1, max: 100, default: 90 }
```

---

## Rate Limiting

The ToSVG API enforces daily rate limits based on your subscription plan:

| Plan       | Daily Limit      |
| ---------- | ---------------- |
| Free       | 100 requests     |
| Starter    | 1,000 requests   |
| Pro        | 10,000 requests  |
| Enterprise | 100,000 requests |

### Checking Rate Limits

```ts
// After any API call, check remaining quota
const info = client.getRateLimitInfo();
if (info) {
  console.log(`Remaining: ${info.remaining}/${info.limit}`);
  console.log(`Resets at: ${info.resetAt.toISOString()}`);
}
```

### Auto Retry

When `retryOnRateLimit` is `true` (default), the SDK automatically:

1. Catches 429 responses
2. Reads the `Retry-After` header
3. Waits with exponential backoff
4. Retries up to `maxRetries` times

```ts
// Disable auto retry
const client = new ToSVGClient("tosvg_live_key", {
  retryOnRateLimit: false,
});
```

---

## Error Handling

The SDK provides 7 typed error classes, all extending `ToSVGError`:

| Error Class           | HTTP Status | When                                    |
| --------------------- | ----------- | --------------------------------------- |
| `AuthenticationError` | 401         | Invalid, missing, or expired API key    |
| `ForbiddenError`      | 403         | IP restriction or subscription required |
| `ValidationError`     | 422         | Invalid parameters                      |
| `RateLimitError`      | 429         | Daily quota exceeded                    |
| `BadRequestError`     | 400         | Unsupported format, file too large      |
| `ServerError`         | 500         | Internal server error                   |
| `NetworkError`        | —           | Connection timeout, DNS failure         |

### Usage

```ts
import {
  ToSVGClient,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  ToSVGError,
} from "tosvg-api";

const client = new ToSVGClient(process.env.TOSVG_API_KEY!);

try {
  const result = await client.imageToSvg("./photo.png");
  console.log(result.svg);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds.`);
  } else if (error instanceof ValidationError) {
    console.log("Validation failed:", error.errors);
    // { image: ['The image field is required.'], ... }
  } else if (error instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (error instanceof ToSVGError) {
    console.log(`API error [${error.statusCode}]: ${error.message}`);
  }
}
```

### Error Properties

All errors inherit from `ToSVGError`:

```ts
error.message; // Human-readable error message
error.statusCode; // HTTP status code (undefined for NetworkError)
error.code; // API error code (e.g. 'INVALID_API_KEY')
error.response; // Raw API error response body
```

Special properties:

- `ValidationError.errors` — `Record<string, string[]>` with field-level errors
- `RateLimitError.retryAfter` — Seconds to wait before retrying
- `NetworkError.cause` — The original underlying error

---

## TypeScript

All types are exported for direct use:

```ts
import type {
  ClientOptions,
  ImageToSvgOptions,
  ImageToSvgResult,
  RemoveBackgroundOptions,
  RemoveBackgroundResult,
  RemoveBackgroundFileResult,
  RemoveBackgroundBase64Result,
  ResizeImageOptions,
  ResizeImageResult,
  RateLimitInfo,
  HealthCheckResult,
  SupportedFormatsResult,
  BackgroundModelsResult,
  ResizeLimitsResult,
  FileInput,
} from "tosvg-api";
```

### Typed Wrapper Example

```ts
import { ToSVGClient } from "tosvg-api";
import type { ImageToSvgOptions, ImageToSvgResult } from "tosvg-api";

async function convertToSvg(
  filePath: string,
  options?: ImageToSvgOptions,
): Promise<ImageToSvgResult> {
  const client = new ToSVGClient(process.env.TOSVG_API_KEY!);
  return client.imageToSvg(filePath, options);
}
```

---

## Examples

### Batch Conversion

```ts
import { readdirSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import { ToSVGClient } from "tosvg-api";

const client = new ToSVGClient(process.env.TOSVG_API_KEY!);
const inputDir = "./images";
const outputDir = "./svgs";

const files = readdirSync(inputDir).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

for (const file of files) {
  const result = await client.imageToSvg(join(inputDir, file));
  const outputName = `${parse(file).name}.svg`;
  writeFileSync(join(outputDir, outputName), result.svg);
  console.log(`✓ ${file} → ${outputName} (${result.conversionTime}s)`);

  // Check rate limit
  const info = client.getRateLimitInfo();
  if (info && info.remaining < 5) {
    console.log("Rate limit approaching, pausing...");
    await new Promise((r) => setTimeout(r, 60_000));
  }
}
```

### Background Removal Pipeline

```ts
import { ToSVGClient } from "tosvg-api";
import { writeFileSync } from "node:fs";

const client = new ToSVGClient(process.env.TOSVG_API_KEY!);

// Step 1: Remove background
const nobg = await client.removeBackground("./product.jpg", {
  model: "isnet-general-use",
  returnBase64: true,
  format: "png",
});

// Step 2: Save the result
const imageBuffer = Buffer.from(nobg.image, "base64");
writeFileSync("./product-nobg.png", imageBuffer);

// Step 3: Resize for thumbnails
const thumb = await client.resizeImage(imageBuffer, {
  width: 200,
  height: 200,
  format: "webp",
  quality: 85,
});

console.log(`Thumbnail: ${thumb.dimensions.width}x${thumb.dimensions.height}`);
```

### Express.js Integration

```ts
import express from "express";
import multer from "multer";
import { ToSVGClient, ValidationError } from "tosvg-api";

const app = express();
const upload = multer();
const client = new ToSVGClient(process.env.TOSVG_API_KEY!);

app.post("/convert", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const result = await client.imageToSvg(req.file.buffer, {
      colorMode: (req.body.colorMode as "color" | "bw") || "color",
    });

    res.type("image/svg+xml").send(result.svg);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({ errors: error.errors });
    } else {
      res.status(500).json({ error: "Conversion failed" });
    }
  }
});

app.listen(3000);
```

---

## API Reference

For the full API specification, see the [ToSVG API Documentation](https://tosvg.com/api).

---

## Requirements

- **Node.js 18** or later
- A ToSVG API key ([get one here](https://tosvg.com/dashboard))

---

## License

[MIT](LICENSE) © ToSVG
