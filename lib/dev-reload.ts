import {
  DEFAULT_DEV_RELOAD_COMMAND,
  DEFAULT_WATCH_DEBOUNCE_MS,
  DEFAULT_WATCH_POLL_INTERVAL_MS,
  DEV_RELOAD_COMMAND_ENV_KEY,
  WATCH_DEBOUNCE_ENV_KEY,
  WATCH_POLL_INTERVAL_ENV_KEY,
  WATCH_POLLING_ENV_KEY,
} from './constants';

export type DevReloadOptions = {
  reloadCommand: string | false;
  watchDebounceMs: number;
  usePolling: boolean;
  pollIntervalMs: number;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (value == null || value.trim().length === 0) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

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

export function resolveDevReloadOptions(
  env: NodeJS.ProcessEnv = process.env,
): DevReloadOptions {
  const commandRaw = env[DEV_RELOAD_COMMAND_ENV_KEY]?.trim();
  let reloadCommand: string | false = DEFAULT_DEV_RELOAD_COMMAND;
  if (commandRaw === 'false' || commandRaw === 'off' || commandRaw === '0') {
    reloadCommand = false;
  } else if (commandRaw && commandRaw.length > 0) {
    reloadCommand = commandRaw;
  }

  return {
    reloadCommand,
    watchDebounceMs: parsePositiveInt(
      env[WATCH_DEBOUNCE_ENV_KEY],
      DEFAULT_WATCH_DEBOUNCE_MS,
    ),
    usePolling: parseBoolean(env[WATCH_POLLING_ENV_KEY], true),
    pollIntervalMs: parsePositiveInt(
      env[WATCH_POLL_INTERVAL_ENV_KEY],
      DEFAULT_WATCH_POLL_INTERVAL_MS,
    ),
  };
}

export function createDevViteWatchConfig(options: DevReloadOptions) {
  return {
    server: {
      hmr: true as const,
      watch: {
        usePolling: options.usePolling,
        interval: options.pollIntervalMs,
      },
    },
  };
}
