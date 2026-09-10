import { describe, expect, it, vi } from 'vitest';
import {
  DOWNLOAD_MESSAGE_TYPE,
  DEFAULT_DOWNLOAD_CONFLICT_ACTION,
} from '@/lib/download/constants';
import { deriveFilenameFromUrl } from '@/lib/download/filename';
import {
  createDownloadRequestMessage,
  isDownloadRequestMessage,
  parseDownloadRequest,
} from '@/lib/download/messages';
import { downloadAuthenticatedFile } from '@/lib/download/download-file';
import { handleDownloadMessage } from '@/lib/download/handle-download-message';
import { isSupportedDownloadUrl } from '@/lib/download/download-file';
import { resolveSupportedLocale } from '@/lib/download/i18n';

describe('authenticated-download', () => {
  it('derives a safe filename from a file url', () => {
    expect(
      deriveFilenameFromUrl('https://cdn.example.com/path/photo%20a.png?x=1'),
    ).toBe('photo a.png');
    expect(deriveFilenameFromUrl('https://cdn.example.com/dir/')).toBe(
      'download',
    );
  });

  it('builds and validates download request messages', () => {
    const message = createDownloadRequestMessage({
      url: 'https://example.com/a.jpg',
      filename: 'a.jpg',
    });
    expect(message.type).toBe(DOWNLOAD_MESSAGE_TYPE);
    expect(isDownloadRequestMessage(message)).toBe(true);
    expect(isDownloadRequestMessage({ type: 'other' })).toBe(false);
    expect(parseDownloadRequest(message)).toEqual({
      url: 'https://example.com/a.jpg',
      filename: 'a.jpg',
      conflictAction: DEFAULT_DOWNLOAD_CONFLICT_ACTION,
      saveAs: false,
      useCredentialsFetch: false,
    });
  });

  it('downloads via the browser downloads api so session auth is used', async () => {
    const download = vi.fn().mockResolvedValue(42);
    const downloadId = await downloadAuthenticatedFile(
      { url: 'https://example.com/secret.png', filename: 'secret.png' },
      { download },
    );
    expect(downloadId).toBe(42);
    expect(download).toHaveBeenCalledWith({
      url: 'https://example.com/secret.png',
      filename: 'secret.png',
      conflictAction: DEFAULT_DOWNLOAD_CONFLICT_ACTION,
      saveAs: false,
    });
  });

  it('fetches with credentials then saves a blob when requested', async () => {
    const blob = new Blob(['img'], { type: 'image/png' });
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    });
    const objectUrl = 'blob:https://example.com/1';
    const createObjectURL = vi.fn().mockReturnValue(objectUrl);
    const revokeObjectURL = vi.fn();
    const download = vi.fn().mockResolvedValue(7);

    const downloadId = await downloadAuthenticatedFile(
      {
        url: 'https://example.com/secret.png',
        filename: 'secret.png',
        useCredentialsFetch: true,
      },
      { download, fetchFn, createObjectURL, revokeObjectURL },
    );

    expect(downloadId).toBe(7);
    expect(fetchFn).toHaveBeenCalledWith('https://example.com/secret.png', {
      credentials: 'include',
      redirect: 'follow',
    });
    expect(download).toHaveBeenCalledWith({
      url: objectUrl,
      filename: 'secret.png',
      conflictAction: DEFAULT_DOWNLOAD_CONFLICT_ACTION,
      saveAs: false,
    });
    expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
  });

  it('handles download messages and reports failures', async () => {
    const download = vi.fn().mockResolvedValue(9);
    const ok = await handleDownloadMessage(
      createDownloadRequestMessage({ url: 'https://example.com/a.png' }),
      { download },
    );
    expect(ok).toEqual({ ok: true, downloadId: 9 });

    const bad = await handleDownloadMessage({ type: DOWNLOAD_MESSAGE_TYPE }, {
      download,
    });
    expect(bad.ok).toBe(false);
  });

  it('shares url validation rules with the side panel form', () => {
    expect(isSupportedDownloadUrl('https://example.com/a.png')).toBe(true);
    expect(isSupportedDownloadUrl('http://example.com/a.png')).toBe(true);
    expect(isSupportedDownloadUrl('ftp://example.com/a.png')).toBe(false);
    expect(isSupportedDownloadUrl('example.com/a.png')).toBe(false);
  });

  it('resolves the supported locale from any browser language tag', () => {
    expect(resolveSupportedLocale('zh-CN')).toBe('zh');
    expect(resolveSupportedLocale('en-US')).toBe('en');
    expect(resolveSupportedLocale('fr-FR')).toBe('en');
    expect(resolveSupportedLocale(undefined)).toBe('en');
  });
});
