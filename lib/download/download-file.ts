import { deriveFilenameFromUrl } from './filename';
import { getDownloadErrorMessage } from './i18n';
import {
  resolveDefaultConflictAction,
  resolveDefaultSaveAs,
  resolveDefaultUseCredentialsFetch,
} from './messages';
import type {
  DownloadFileRequest,
  DownloadRuntime,
} from './types';

/** Shared with the side panel form so UI and background validate identically. */
export function isSupportedDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function assertHttpUrl(url: string): URL {
  if (!isSupportedDownloadUrl(url)) {
    throw new Error(getDownloadErrorMessage('invalidUrl'));
  }
  return new URL(url);
}

async function downloadViaCredentialsFetch(
  request: Required<
    Pick<DownloadFileRequest, 'url' | 'filename' | 'conflictAction' | 'saveAs'>
  >,
  runtime: DownloadRuntime,
): Promise<number> {
  const fetchFn = runtime.fetchFn ?? fetch;
  const createObjectURL =
    runtime.createObjectURL ?? URL.createObjectURL.bind(URL);
  const revokeObjectURL =
    runtime.revokeObjectURL ?? URL.revokeObjectURL.bind(URL);

  const response = await fetchFn(request.url, {
    credentials: 'include',
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(
      getDownloadErrorMessage('fetchFailed', {
        status: String(response.status),
      }),
    );
  }

  const blob = await response.blob();
  const objectUrl = createObjectURL(blob);
  try {
    return await runtime.download({
      url: objectUrl,
      filename: request.filename,
      conflictAction: request.conflictAction,
      saveAs: request.saveAs,
    });
  } finally {
    revokeObjectURL(objectUrl);
  }
}

export async function downloadAuthenticatedFile(
  request: DownloadFileRequest,
  runtime: DownloadRuntime,
): Promise<number> {
  const url = request.url?.trim() ?? '';
  if (url.length === 0) {
    throw new Error(getDownloadErrorMessage('missingUrl'));
  }
  assertHttpUrl(url);

  const options = {
    url,
    filename: request.filename?.trim() || deriveFilenameFromUrl(url),
    conflictAction: request.conflictAction ?? resolveDefaultConflictAction(),
    saveAs: request.saveAs ?? resolveDefaultSaveAs(),
  };

  const useCredentialsFetch =
    request.useCredentialsFetch ?? resolveDefaultUseCredentialsFetch();
  if (useCredentialsFetch) {
    return downloadViaCredentialsFetch(options, runtime);
  }

  return runtime.download(options);
}
