import { describe, it, expect } from 'vitest';
import { createReadStream, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { resolveFileInputAsync } from '../../src/utils/file-input.js';

const TMP_DIR = join(import.meta.dirname, '..', '.tmp');
const TMP_FILE = join(TMP_DIR, 'test-image.png');

// Create a fake PNG file for testing
const FAKE_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG header
  0x00, 0x00, 0x00, 0x01, // rest is just padding
]);

describe('resolveFileInputAsync', () => {
  beforeAll(() => {
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(TMP_FILE, FAKE_PNG);
  });

  afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('should resolve a file path (string) to a Blob', async () => {
    const { blob, filename } = await resolveFileInputAsync(TMP_FILE);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(FAKE_PNG.length);
    expect(filename).toBe('test-image.png');
  });

  it('should resolve a Buffer to a Blob', async () => {
    const { blob, filename } = await resolveFileInputAsync(FAKE_PNG);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(FAKE_PNG.length);
    expect(filename).toBe('image');
  });

  it('should resolve a ReadStream to a Blob', async () => {
    const stream = createReadStream(TMP_FILE);
    const { blob, filename } = await resolveFileInputAsync(stream);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(FAKE_PNG.length);
    expect(filename).toBe('test-image.png');
  });

  it('should throw on invalid input', async () => {
    // @ts-expect-error — Testing invalid input
    await expect(resolveFileInputAsync(12345)).rejects.toThrow(
      'Invalid file input',
    );
    // @ts-expect-error — Testing invalid input
    await expect(resolveFileInputAsync({})).rejects.toThrow(
      'Invalid file input',
    );
  });
});
