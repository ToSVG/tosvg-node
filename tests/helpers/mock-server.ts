import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const BASE_URL = 'https://tosvg.com/api/v1';

/**
 * Default rate limit headers added to every response.
 */
const rateLimitHeaders = {
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
  'X-Response-Time': '100ms',
};

/**
 * MSW handlers that mock the ToSVG API.
 */
export const handlers = [
  // ─── Image to SVG ──────────────────────────────
  http.post(`${BASE_URL}/convert/image-to-svg`, async ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401, headers: rateLimitHeaders },
      );
    }
    if (apiKey === 'tosvg_test_invalid') {
      return HttpResponse.json(
        { success: false, message: 'The provided API key is invalid' },
        { status: 401, headers: rateLimitHeaders },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>',
          file_size: 1234,
          conversion_time: 0.85,
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),

  // ─── Remove Background ────────────────────────
  http.post(`${BASE_URL}/background/remove`, async ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401, headers: rateLimitHeaders },
      );
    }

    const formData = await request.formData();
    const returnBase64 = formData.get('return_base64');

    if (returnBase64 === 'true') {
      return HttpResponse.json(
        {
          success: true,
          data: {
            image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
            format: 'png',
            file_size: 95,
            processing_time: 1.23,
            provider: 'rembg',
          },
        },
        { status: 200, headers: rateLimitHeaders },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          filename: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.png',
          path: 'removed-background/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png',
          file_size: 56780,
          processing_time: 1.23,
          provider: 'rembg',
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),

  // ─── Resize Image ─────────────────────────────
  http.post(`${BASE_URL}/resize/image`, async ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401, headers: rateLimitHeaders },
      );
    }

    const formData = await request.formData();
    const width = Number(formData.get('width'));
    const height = Number(formData.get('height'));

    return HttpResponse.json(
      {
        success: true,
        data: {
          path: 'resized/a1b2c3d4.png',
          size: 45200,
          dimensions: { width, height },
          quality: 90,
          format: formData.get('format') || 'png',
          processing_time: 0.45,
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),

  // ─── Health Check ──────────────────────────────
  http.get(`${BASE_URL}/health`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          status: 'healthy',
          timestamp: '2026-02-06T12:00:00.000000Z',
          services: {
            image_conversion: 'operational',
            background_removal: 'operational',
            image_resize: 'operational',
          },
        },
      },
      { status: 200 },
    );
  }),

  // ─── Supported Formats ────────────────────────
  http.get(`${BASE_URL}/convert/supported-formats`, ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          formats: {
            png: { max_size: '10MB', description: 'PNG image format' },
            jpg: { max_size: '10MB', description: 'JPEG image format' },
          },
          max_dimensions: '4096x4096 pixels',
          max_file_size: '10MB',
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),

  // ─── Background Models ────────────────────────
  http.get(`${BASE_URL}/background/models`, ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          provider: 'rembg',
          models: ['u2net', 'silueta', 'u2net_human_seg', 'isnet-general-use'],
          available_providers: ['rembg', 'withoutbg'],
          default_provider: 'rembg',
          supported_formats: ['png', 'jpg', 'jpeg'],
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),

  // ─── Resize Limits ────────────────────────────
  http.get(`${BASE_URL}/resize/limits`, ({ request }) => {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return HttpResponse.json(
        { success: false, message: 'API key is required' },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          max_dimensions: { width: 4096, height: 4096 },
          min_dimensions: { width: 1, height: 1 },
          max_file_size: '10MB',
          supported_formats: ['png', 'jpg', 'jpeg', 'webp'],
          quality_range: { min: 1, max: 100, default: 90 },
        },
      },
      { status: 200, headers: rateLimitHeaders },
    );
  }),
];

/**
 * MSW server instance for use in tests.
 */
export const server = setupServer(...handlers);
