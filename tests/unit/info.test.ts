import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ToSVGClient } from '../../src/client.js';
import { server } from '../helpers/mock-server.js';

const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Info Methods', () => {
  describe('healthCheck', () => {
    it('should return health status', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.healthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.services).toBeDefined();
      expect(result.services['image_conversion']).toBe('operational');
    });
  });

  describe('getSupportedFormats', () => {
    it('should return supported formats', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getSupportedFormats();

      expect(result).toBeDefined();
      expect(result.formats).toBeDefined();
      expect(result.formats['png']).toBeDefined();
      expect(result.maxDimensions).toBe('4096x4096 pixels');
      expect(result.maxFileSize).toBe('10MB');
    });

    it('should map snake_case to camelCase', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getSupportedFormats();

      expect(result).toHaveProperty('maxDimensions');
      expect(result).toHaveProperty('maxFileSize');
      expect(result).not.toHaveProperty('max_dimensions');
      expect(result).not.toHaveProperty('max_file_size');
    });
  });

  describe('getModels', () => {
    it('should return available models', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getModels();

      expect(result).toBeDefined();
      expect(result.models).toContain('u2net');
      expect(result.availableProviders).toContain('rembg');
      expect(result.defaultProvider).toBe('rembg');
    });

    it('should map snake_case to camelCase', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getModels();

      expect(result).toHaveProperty('availableProviders');
      expect(result).toHaveProperty('defaultProvider');
      expect(result).toHaveProperty('supportedFormats');
      expect(result).not.toHaveProperty('available_providers');
      expect(result).not.toHaveProperty('default_provider');
    });
  });

  describe('getResizeLimits', () => {
    it('should return resize limits', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getResizeLimits();

      expect(result).toBeDefined();
      expect(result.maxDimensions).toEqual({ width: 4096, height: 4096 });
      expect(result.minDimensions).toEqual({ width: 1, height: 1 });
      expect(result.qualityRange).toEqual({ min: 1, max: 100, default: 90 });
    });

    it('should map snake_case to camelCase', async () => {
      const client = new ToSVGClient(API_KEY);
      const result = await client.getResizeLimits();

      expect(result).toHaveProperty('maxDimensions');
      expect(result).toHaveProperty('minDimensions');
      expect(result).toHaveProperty('maxFileSize');
      expect(result).toHaveProperty('qualityRange');
    });
  });
});
