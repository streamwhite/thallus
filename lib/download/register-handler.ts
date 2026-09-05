import { handleDownloadMessage } from '@/lib/download/handle-download-message';
import type { DownloadFileResult } from '@/lib/download/types';

function createBrowserDownloadRuntime() {
  return {
    download: (options: {
      url: string;
      filename?: string;
      conflictAction?: 'uniquify' | 'overwrite' | 'prompt';
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
