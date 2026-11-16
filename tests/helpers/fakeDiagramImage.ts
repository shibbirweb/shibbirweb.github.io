import fs from 'node:fs';
import { vi } from 'vitest';

/** The smallest byte run that reads as a PNG: its signature plus an IHDR size. */
export function pngHeader(width: number, height: number): Buffer {
    const bytes = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(bytes, 0);
    bytes.writeUInt32BE(13, 8);
    bytes.write('IHDR', 12, 'ascii');
    bytes.writeUInt32BE(width, 16);
    bytes.writeUInt32BE(height, 20);
    return bytes;
}

/**
 * Makes one file look present on disk with the given bytes, leaving every other
 * path to the real file system. Restore with vi.restoreAllMocks().
 */
export function fakeFileOnDisk(filePath: string, bytes: Buffer): void {
    const realExistsSync = fs.existsSync;
    const realReadFileSync = fs.readFileSync;
    vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
        if (candidate === filePath) {
            return true;
        }
        return realExistsSync(candidate);
    });
    vi.spyOn(fs, 'readFileSync').mockImplementation(((
        candidate: fs.PathOrFileDescriptor,
        options?: unknown
    ) => {
        if (candidate === filePath) {
            return bytes;
        }
        return realReadFileSync(
            candidate,
            options as Parameters<typeof fs.readFileSync>[1]
        );
    }) as typeof fs.readFileSync);
}
