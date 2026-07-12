export const BASE_FONT_SIZE_PX = 16;

export const FONT_SIZE_SCALES = {
  sm: 0.875,
  md: 1,
  lg: 1.125,
  xl: 1.25,
} as const;

export type FontSizeScaleName = keyof typeof FONT_SIZE_SCALES;

export const DEFAULT_FONT_SIZE_SCALE: FontSizeScaleName = 'md';

export const CHROME_DATA_DIR_ENV_KEY = 'WXT_CHROME_DATA_DIR';

export const DEFAULT_CHROME_DATA_DIR = '.wxt/chrome-data';

export const DEV_EXTENSION_ID_ENV_KEY = 'WXT_DEV_EXTENSION_ID';

export const EXTENSION_PUBLIC_KEY_ENV_KEY = 'WXT_EXTENSION_PUBLIC_KEY';

export const DEV_AUTO_PIN_ENV_KEY = 'WXT_DEV_AUTO_PIN';

export const DEV_RELOAD_COMMAND_ENV_KEY = 'WXT_DEV_RELOAD_COMMAND';

export const DEFAULT_DEV_RELOAD_COMMAND = 'Alt+R';

export const WATCH_DEBOUNCE_ENV_KEY = 'WXT_WATCH_DEBOUNCE';

export const DEFAULT_WATCH_DEBOUNCE_MS = 300;

export const WATCH_POLLING_ENV_KEY = 'WXT_WATCH_POLLING';

export const WATCH_POLL_INTERVAL_ENV_KEY = 'WXT_WATCH_POLL_INTERVAL';

export const DEFAULT_WATCH_POLL_INTERVAL_MS = 300;

export const PREFERENCES_FILE_NAME = 'Preferences';

export const DEFAULT_PROFILE_DIR_NAME = 'Default';
