import type { DownloadConflictAction } from './constants';

export type DownloadFileRequest = {
  url: string;
  filename?: string;
  conflictAction?: DownloadConflictAction;
  saveAs?: boolean;
  useCredentialsFetch?: boolean;
};

export type DownloadFileSuccess = {
  ok: true;
  downloadId: number;
};

export type DownloadFileFailure = {
  ok: false;
  error: string;
};

export type DownloadFileResult = DownloadFileSuccess | DownloadFileFailure;

export type DownloadRequestMessage = {
  type: string;
  payload: DownloadFileRequest;
};

export type DownloadsApi = {
  download: (options: {
    url: string;
    filename?: string;
    conflictAction?: DownloadConflictAction;
    saveAs?: boolean;
  }) => Promise<number>;
};

export type DownloadRuntime = {
  download: DownloadsApi['download'];
  fetchFn?: typeof fetch;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
};
