export const DOWNLOAD_MESSAGE_TYPE = 'extension-dev-template:download-file';

export const DOWNLOAD_CONFLICT_ACTIONS = [
  'uniquify',
  'overwrite',
  'prompt',
] as const;

export type DownloadConflictAction =
  (typeof DOWNLOAD_CONFLICT_ACTIONS)[number];

export const DEFAULT_DOWNLOAD_CONFLICT_ACTION: DownloadConflictAction =
  'uniquify';

export const DOWNLOAD_CONFLICT_ACTION_ENV_KEY = 'WXT_DOWNLOAD_CONFLICT_ACTION';

export const DOWNLOAD_SAVE_AS_ENV_KEY = 'WXT_DOWNLOAD_SAVE_AS';

export const DOWNLOAD_USE_CREDENTIALS_FETCH_ENV_KEY =
  'WXT_DOWNLOAD_USE_CREDENTIALS_FETCH';

export const DEFAULT_DOWNLOAD_FILENAME = 'download';
