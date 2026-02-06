import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ToSVGClient } from '../../src/client.js';
import { server } from '../helpers/mock-server.js';

const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('imageToSvg', () => {
  it('should convert an image buffer to SVG', async () => {
    const client = new ToSVGClient(API_KEY);
    const imageBuffer = Buffer.from('fake-image-data');

    const result = await client.imageToSvg(imageBuffer);

    expect(result).toBeDefined();
    expect(result.svg).toContain('<svg');
    expect(result.fileSize).toBe(1234);
    expect(result.conversionTime).toBe(0.85);
  });

  it('should convert with custom options', async () => {
    const client = new ToSVGClient(API_KEY);
    const imageBuffer = Buffer.from('fake-image-data');

    const result = await client.imageToSvg(imageBuffer, {
      colorMode: 'bw',
      mode: 'spline',
      filterSpeckle: 12,
      cornerThreshold: 60,
      colorPrecision: 8,
    });

    expect(result.svg).toContain('<svg');
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it('should map response snake_case to camelCase', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.imageToSvg(Buffer.from('test'));

    // Ensure camelCase properties exist (not snake_case)
    expect(result).toHaveProperty('svg');
    expect(result).toHaveProperty('fileSize');
    expect(result).toHaveProperty('conversionTime');
    expect(result).not.toHaveProperty('file_size');
    expect(result).not.toHaveProperty('conversion_time');
  });
});
