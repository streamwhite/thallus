import { browser } from 'wxt/browser';
import type { DownloadConflictAction } from './constants';
import { handleDownloadMessage } from './handle-download-message';
import type { DownloadFileResult, DownloadRuntime } from './types';

function createBrowserDownloadRuntime(): DownloadRuntime {
  return {
    download: (options: {
      url: string;
      filename?: string;
      conflictAction?: DownloadConflictAction;
      saveAs?: boolean;
    }) => browser.downloads.download(options),
  };
}

export function registerAuthenticatedDownloadHandler(): void {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    void handleDownloadMessage(message, createBrowserDownloadRuntime())
      .then((result: DownloadFileResult) => {
        sendResponse(result);
      })
      .catch((error: unknown) => {
        console.error('Authenticated download handler failed', error);
        sendResponse({
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : 'Authenticated download handler failed',
        } satisfies DownloadFileResult);
      });
    return true;
  });
}
