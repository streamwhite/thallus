import { DEFAULT_DOWNLOAD_FILENAME } from './constants';

export function deriveFilenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith('/')) {
      return DEFAULT_DOWNLOAD_FILENAME;
    }
    const segment = pathname.split('/').filter(Boolean).at(-1);
    if (!segment) {
      return DEFAULT_DOWNLOAD_FILENAME;
    }
    return decodeURIComponent(segment);
  } catch {
    return DEFAULT_DOWNLOAD_FILENAME;
  }
}
