import { basename } from 'node:path';
import type { ReadStream } from 'node:fs';
import type { FileInput } from '../types/common.js';

/**
 * Reads a file input into a Blob asynchronously.
 * This is the primary method used by resource classes.
 */
export async function resolveFileInputAsync(
  input: FileInput,
): Promise<{ blob: Blob; filename: string }> {
  // String → file path
  if (typeof input === 'string') {
    const { readFile } = await import('node:fs/promises');
    const buffer = await readFile(input);
    const filename = basename(input);
    const blob = new Blob([buffer]);
    return { blob, filename };
  }

  // Buffer → Blob
  if (Buffer.isBuffer(input)) {
    const blob = new Blob([input]);
    return { blob, filename: 'image' };
  }

  // ReadStream → collect chunks
  if (isReadStream(input)) {
    const chunks: Buffer[] = [];
    for await (const chunk of input) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
    }
    const buffer = Buffer.concat(chunks);
    const blob = new Blob([buffer]);
    const filename =
      typeof input.path === 'string' ? basename(input.path) : 'image';
    return { blob, filename };
  }

  throw new Error(
    'Invalid file input. Expected a file path (string), Buffer, or ReadStream.',
  );
}

/**
 * Type guard to check if a value is a Node.js ReadStream.
 */
function isReadStream(value: unknown): value is ReadStream {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pipe' in value &&
    'path' in value &&
    typeof (value as ReadStream).read === 'function'
  );
}
