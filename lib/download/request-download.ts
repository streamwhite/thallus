import { createDownloadRequestMessage } from '@/lib/download/messages';
import { getDownloadErrorMessage } from '@/lib/download/i18n';
import type {
  DownloadFileRequest,
  DownloadFileResult,
} from '@/lib/download/types';

export async function requestAuthenticatedDownload(
  request: DownloadFileRequest,
): Promise<DownloadFileResult> {
  try {
    const result = await browser.runtime.sendMessage(
      createDownloadRequestMessage(request),
    );
    if (
      result != null &&
      typeof result === 'object' &&
      'ok' in result &&
      typeof (result as DownloadFileResult).ok === 'boolean'
    ) {
      return result as DownloadFileResult;
    }
    return {
      ok: false,
      error: getDownloadErrorMessage('requestFailed'),
    };
  } catch (error) {
    console.error(getDownloadErrorMessage('requestFailed'), error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : getDownloadErrorMessage('requestFailed'),
    };
  }
}
