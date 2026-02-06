import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ToSVGClient } from '../../src/client.js';
import {
  ToSVGError,
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  RateLimitError,
  BadRequestError,
  ServerError,
  NetworkError,
} from '../../src/errors/index.js';
import { server } from '../helpers/mock-server.js';

const BASE_URL = 'https://tosvg.com/api/v1';
const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Error Classes', () => {
  describe('ToSVGError', () => {
    it('should be an instance of Error', () => {
      const error = new ToSVGError('test', 500, 'TEST');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ToSVGError);
      expect(error.message).toBe('test');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST');
      expect(error.name).toBe('ToSVGError');
    });
  });

  describe('AuthenticationError (401)', () => {
    it('should be thrown on 401 response', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            { success: false, message: 'The provided API key is invalid' },
            { status: 401 },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY);
      await expect(client.imageToSvg(Buffer.from('test'))).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('should have correct properties', () => {
      const error = new AuthenticationError('Invalid key', 'INVALID_API_KEY');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('INVALID_API_KEY');
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(ToSVGError);
    });
  });

  describe('ForbiddenError (403)', () => {
    it('should be thrown on 403 response', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            { success: false, message: 'IP restricted' },
            { status: 403 },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY, { retryOnRateLimit: false });
      await expect(client.imageToSvg(Buffer.from('test'))).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe('ValidationError (422)', () => {
    it('should be thrown on 422 response with field errors', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                image: ['The image field is required.'],
                'options.color_mode': ['The selected color_mode is invalid.'],
              },
            },
            { status: 422 },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY);
      try {
        await client.imageToSvg(Buffer.from('test'));
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.errors).toBeDefined();
        expect(validationError.errors['image']).toContain(
          'The image field is required.',
        );
        expect(validationError.statusCode).toBe(422);
      }
    });
  });

  describe('RateLimitError (429)', () => {
    it('should be thrown on 429 response', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Rate limit exceeded',
              retry_after: 3600,
            },
            { status: 429, headers: { 'Retry-After': '3600' } },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY, { retryOnRateLimit: false });
      try {
        await client.imageToSvg(Buffer.from('test'));
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        const rateLimitError = error as RateLimitError;
        expect(rateLimitError.retryAfter).toBe(3600);
        expect(rateLimitError.statusCode).toBe(429);
      }
    });
  });

  describe('BadRequestError (400)', () => {
    it('should be thrown on 400 response', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            { success: false, message: 'File format not supported' },
            { status: 400 },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY);
      await expect(client.imageToSvg(Buffer.from('test'))).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('ServerError (500)', () => {
    it('should be thrown on 500 response', async () => {
      server.use(
        http.post(`${BASE_URL}/convert/image-to-svg`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 },
          );
        }),
      );

      const client = new ToSVGClient(API_KEY);
      await expect(client.imageToSvg(Buffer.from('test'))).rejects.toThrow(
        ServerError,
      );
    });
  });

  describe('NetworkError', () => {
    it('should have correct properties', () => {
      const cause = new Error('ECONNREFUSED');
      const error = new NetworkError('Connection failed', cause);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection failed');
      expect(error.cause).toBe(cause);
      expect(error.statusCode).toBeUndefined();
    });
  });
});
