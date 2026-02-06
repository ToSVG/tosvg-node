# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-06

### Added

- Initial release
- `imageToSvg()` — Raster image to SVG conversion
- `removeBackground()` — AI-powered background removal
- `resizeImage()` — Image resizing with aspect ratio control
- `healthCheck()` — Service health status
- `getSupportedFormats()` — List supported input formats
- `getModels()` — List available AI models
- `getResizeLimits()` — Get resize dimension limits
- `getRateLimitInfo()` — Query current rate limit status
- Auto retry on 429 with exponential backoff
- 7 typed error classes for precise error handling
- Full TypeScript type definitions
- ESM and CommonJS dual output
