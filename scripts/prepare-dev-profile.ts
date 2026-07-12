import {
  ensureExtensionPinned,
  isDevAutoPinEnabled,
  resolveChromeDataDir,
} from '../lib/dev-profile';
import { resolveDevExtensionId } from '../lib/extension-identity';

export async function prepareDevProfile(
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ pinned: boolean; extensionId: string; chromeDataDir: string }> {
  const chromeDataDir = resolveChromeDataDir(env);
  const extensionId = resolveDevExtensionId(env);

  if (!isDevAutoPinEnabled(env)) {
    return { pinned: false, extensionId, chromeDataDir };
  }

  try {
    await ensureExtensionPinned(chromeDataDir, extensionId);
    return { pinned: true, extensionId, chromeDataDir };
  } catch (error) {
    console.error('Failed to auto-pin extension in the Chrome profile', error);
    throw error;
  }
}
