import { resolveChromeDataDir } from './dev-profile';

export type WebExtPersistOptions =
  | { chromiumArgs: string[] }
  | { chromiumProfile: string; keepProfileChanges: true };

export function createPersistWebExtOptions(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  cwd = process.cwd(),
): WebExtPersistOptions {
  const chromeDataDir = resolveChromeDataDir(env, cwd);
  if (platform === 'win32') {
    return {
      chromiumProfile: chromeDataDir,
      keepProfileChanges: true,
    };
  }
  return {
    chromiumArgs: [`--user-data-dir=${chromeDataDir}`],
  };
}
