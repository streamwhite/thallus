import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const isBuilt = existsSync(resolve(process.cwd(), 'dist/lib/index.js'));

/**
 * Checks the published artifact (dist/) end to end: the entry barrel must be
 * resolvable by a bundler (extensionless ESM imports) and expose the public api.
 * Skipped until `pnpm build:lib` has produced dist/.
 */
describe.skipIf(!isBuilt)('published package build (dist/)', () => {
  it('resolves the built entry and exposes the public api', async () => {
    const pkg = await import('../../dist/lib/index.js');

    expect(pkg.DOWNLOAD_MESSAGE_TYPE).toBeTypeOf('string');
    expect(pkg.requestAuthenticatedDownload).toBeTypeOf('function');
    expect(pkg.registerAuthenticatedDownloadHandler).toBeTypeOf('function');
    expect(pkg.downloadAuthenticatedFile).toBeTypeOf('function');
  });

  it('ships working locale catalogs with the download errors', async () => {
    const { getDownloadErrorMessage } = await import(
      '../../dist/lib/download/i18n.js'
    );
    expect(getDownloadErrorMessage('fetchFailed', { status: '404' })).toContain(
      '404',
    );
    expect(getDownloadErrorMessage('invalidUrl', {}, 'zh-CN')).toContain('http');
  });

  it('keeps pure helpers usable outside the browser api', async () => {
    const { toRem, deriveFilenameFromUrl } = await import('../../dist/lib/index.js');
    expect(toRem(16)).toBe('1rem');
    expect(deriveFilenameFromUrl('https://cdn.example.com/a/photo.png')).toBe(
      'photo.png',
    );
  });
});
