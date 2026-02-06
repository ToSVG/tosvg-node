import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ToSVGClient } from '../../src/client.js';
import { server } from '../helpers/mock-server.js';

const API_KEY = 'tosvg_test_valid_key_for_testing_12345';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ToSVGClient', () => {
  it('should create a client with default options', () => {
    const client = new ToSVGClient(API_KEY);
    expect(client).toBeInstanceOf(ToSVGClient);
  });

  it('should create a client with custom options', () => {
    const client = new ToSVGClient(API_KEY, {
      baseUrl: 'https://custom.api.com/v1',
      timeout: 60000,
      retryOnRateLimit: false,
      maxRetries: 5,
    });
    expect(client).toBeInstanceOf(ToSVGClient);
  });

  it('should throw when API key is empty', () => {
    expect(() => new ToSVGClient('')).toThrow('API key is required');
  });

  it('should throw when API key is not a string', () => {
    // @ts-expect-error — Testing invalid input
    expect(() => new ToSVGClient(undefined)).toThrow('API key is required');
    // @ts-expect-error — Testing invalid input
    expect(() => new ToSVGClient(null)).toThrow('API key is required');
  });

  it('should return null for rate limit info before any request', () => {
    const client = new ToSVGClient(API_KEY);
    expect(client.getRateLimitInfo()).toBeNull();
  });

  it('should parse rate limit headers after a request', async () => {
    const client = new ToSVGClient(API_KEY);
    const imageBuffer = Buffer.from('fake-image-data');
    await client.imageToSvg(imageBuffer);

    const info = client.getRateLimitInfo();
    expect(info).not.toBeNull();
    expect(info!.limit).toBe(1000);
    expect(info!.remaining).toBe(999);
    expect(info!.resetAt).toBeInstanceOf(Date);
  });
});
