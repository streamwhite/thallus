import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  CHROME_DATA_DIR_ENV_KEY,
  DEFAULT_CHROME_DATA_DIR,
  DEFAULT_PROFILE_DIR_NAME,
  DEV_AUTO_PIN_ENV_KEY,
  PREFERENCES_FILE_NAME,
} from './constants';

type PreferencesJson = {
  extensions?: {
    pinned_extensions?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function resolveChromeDataDir(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): string {
  const configured = env[CHROME_DATA_DIR_ENV_KEY]?.trim();
  const relativePath = configured && configured.length > 0
    ? configured
    : DEFAULT_CHROME_DATA_DIR;
  return resolve(cwd, relativePath);
}

export function isDevAutoPinEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env[DEV_AUTO_PIN_ENV_KEY]?.trim().toLowerCase();
  if (value === '0' || value === 'false' || value === 'off') {
    return false;
  }
  return true;
}

export function mergePinnedExtensions(
  preferences: PreferencesJson,
  extensionId: string,
): PreferencesJson {
  const pinned = preferences.extensions?.pinned_extensions ?? [];
  if (pinned.includes(extensionId)) {
    return preferences;
  }
  return {
    ...preferences,
    extensions: {
      ...preferences.extensions,
      pinned_extensions: [...pinned, extensionId],
    },
  };
}

export function preferencesFilePath(chromeDataDir: string): string {
  return join(chromeDataDir, DEFAULT_PROFILE_DIR_NAME, PREFERENCES_FILE_NAME);
}

export async function ensureExtensionPinned(
  chromeDataDir: string,
  extensionId: string,
): Promise<boolean> {
  const trimmedId = extensionId.trim();
  if (trimmedId.length === 0) {
    throw new Error('extensionId is required to pin the extension');
  }

  const filePath = preferencesFilePath(chromeDataDir);
  await mkdir(join(chromeDataDir, DEFAULT_PROFILE_DIR_NAME), { recursive: true });

  let preferences: PreferencesJson = {};
  try {
    const raw = await readFile(filePath, 'utf8');
    preferences = JSON.parse(raw) as PreferencesJson;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      throw error;
    }
  }

  const next = mergePinnedExtensions(preferences, trimmedId);
  const changed = JSON.stringify(next) !== JSON.stringify(preferences);
  if (changed) {
    await writeFile(filePath, `${JSON.stringify(next)}\n`, 'utf8');
  }
  return changed;
}
