import { downloadAuthenticatedFile } from './download-file';
import { getDownloadErrorMessage } from './i18n';
import {
  isDownloadRequestMessage,
  parseDownloadRequest,
} from './messages';
import type {
  DownloadFileResult,
  DownloadRuntime,
} from './types';

export async function handleDownloadMessage(
  message: unknown,
  runtime: DownloadRuntime,
): Promise<DownloadFileResult> {
  if (!isDownloadRequestMessage(message)) {
    return {
      ok: false,
      error: getDownloadErrorMessage('invalidMessage'),
    };
  }

  try {
    const request = parseDownloadRequest(message);
    const downloadId = await downloadAuthenticatedFile(request, runtime);
    return { ok: true, downloadId };
  } catch (error) {
    const fallback = getDownloadErrorMessage('requestFailed');
    const details = error instanceof Error ? error.message : fallback;
    console.error(fallback, error);
    return { ok: false, error: details };
  }
}
