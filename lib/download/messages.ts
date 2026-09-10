import {
  DEFAULT_DOWNLOAD_CONFLICT_ACTION,
  DOWNLOAD_CONFLICT_ACTIONS,
  DOWNLOAD_CONFLICT_ACTION_ENV_KEY,
  DOWNLOAD_MESSAGE_TYPE,
  DOWNLOAD_SAVE_AS_ENV_KEY,
  DOWNLOAD_USE_CREDENTIALS_FETCH_ENV_KEY,
  type DownloadConflictAction,
} from './constants';
import type {
  DownloadFileRequest,
  DownloadRequestMessage,
} from './types';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim().length === 0) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'on') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off') {
    return false;
  }
  return fallback;
}

export function resolveDefaultConflictAction(
  env: NodeJS.ProcessEnv = process.env,
): DownloadConflictAction {
  const raw = env[DOWNLOAD_CONFLICT_ACTION_ENV_KEY]?.trim();
  if (
    raw &&
    (DOWNLOAD_CONFLICT_ACTIONS as readonly string[]).includes(raw)
  ) {
    return raw as DownloadConflictAction;
  }
  return DEFAULT_DOWNLOAD_CONFLICT_ACTION;
}

export function resolveDefaultSaveAs(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return parseBoolean(env[DOWNLOAD_SAVE_AS_ENV_KEY], false);
}

export function resolveDefaultUseCredentialsFetch(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return parseBoolean(env[DOWNLOAD_USE_CREDENTIALS_FETCH_ENV_KEY], false);
}

export function createDownloadRequestMessage(
  request: DownloadFileRequest,
): DownloadRequestMessage {
  return {
    type: DOWNLOAD_MESSAGE_TYPE,
    payload: request,
  };
}

export function isDownloadRequestMessage(
  message: unknown,
): message is DownloadRequestMessage {
  if (message == null || typeof message !== 'object') {
    return false;
  }
  const candidate = message as Partial<DownloadRequestMessage>;
  return (
    candidate.type === DOWNLOAD_MESSAGE_TYPE &&
    candidate.payload != null &&
    typeof candidate.payload === 'object'
  );
}

export function parseDownloadRequest(
  message: DownloadRequestMessage,
  env: NodeJS.ProcessEnv = process.env,
): DownloadFileRequest {
  const payload = message.payload;
  return {
    url: typeof payload.url === 'string' ? payload.url.trim() : '',
    filename:
      typeof payload.filename === 'string' && payload.filename.trim().length > 0
        ? payload.filename.trim()
        : undefined,
    conflictAction: payload.conflictAction ?? resolveDefaultConflictAction(env),
    saveAs: payload.saveAs ?? resolveDefaultSaveAs(env),
    useCredentialsFetch:
      payload.useCredentialsFetch ?? resolveDefaultUseCredentialsFetch(env),
  };
}
