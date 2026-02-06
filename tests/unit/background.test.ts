import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ToSVGClient } from '../../src/client.js';
import { server } from '../helpers/mock-server.js';

const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('removeBackground', () => {
  it('should return file path result by default', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.removeBackground(Buffer.from('fake-image'));

    expect(result).toBeDefined();
    expect(result.fileSize).toBe(56780);
    expect(result.processingTime).toBe(1.23);
    expect(result.provider).toBe('rembg');
    expect('filename' in result).toBe(true);
    expect('path' in result).toBe(true);
  });

  it('should return base64 result when returnBase64 is true', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.removeBackground(Buffer.from('fake-image'), {
      returnBase64: true,
    });

    expect(result).toBeDefined();
    expect('image' in result).toBe(true);
    expect('format' in result).toBe(true);
    expect(result.provider).toBe('rembg');
    expect(result.processingTime).toBe(1.23);
  });

  it('should map response to camelCase', async () => {
    const client = new ToSVGClient(API_KEY);
    const result = await client.removeBackground(Buffer.from('test'));

    expect(result).toHaveProperty('fileSize');
    expect(result).toHaveProperty('processingTime');
    expect(result).not.toHaveProperty('file_size');
    expect(result).not.toHaveProperty('processing_time');
  });
});
