import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ToSVGClient } from '../../src/client.js';
import { server } from '../helpers/mock-server.js';

const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('resizeImage', () => {
  it('should resize an image with required options', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.resizeImage(Buffer.from('fake-image'), {
      width: 800,
      height: 600,
    });

    expect(result).toBeDefined();
    expect(result.dimensions.width).toBe(800);
    expect(result.dimensions.height).toBe(600);
    expect(result.quality).toBe(90);
    expect(result.format).toBe('png');
    expect(result.processingTime).toBe(0.45);
    expect(result.size).toBe(45200);
  });

  it('should resize with custom format and quality', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.resizeImage(Buffer.from('fake-image'), {
      width: 400,
      height: 300,
      format: 'webp',
      quality: 75,
      maintainAspectRatio: false,
    });

    expect(result.dimensions.width).toBe(400);
    expect(result.dimensions.height).toBe(300);
    expect(result.format).toBe('webp');
  });

  it('should map response to camelCase', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.resizeImage(Buffer.from('test'), {
      width: 100,
      height: 100,
    });

    expect(result).toHaveProperty('processingTime');
    expect(result).not.toHaveProperty('processing_time');
  });
});
