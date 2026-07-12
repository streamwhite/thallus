import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BASE_FONT_SIZE_PX,
  CHROME_DATA_DIR_ENV_KEY,
  DEFAULT_CHROME_DATA_DIR,
  DEFAULT_FONT_SIZE_SCALE,
  DEV_AUTO_PIN_ENV_KEY,
} from '@/lib/constants';
import {
  ensureExtensionPinned,
  isDevAutoPinEnabled,
  mergePinnedExtensions,
  resolveChromeDataDir,
} from '@/lib/dev-profile';
import {
  applyExtensionUiFontSize,
  applyFontSizeScale,
  isFontSizeScaleName,
  resolveFontSizeScale,
  toRem,
} from '@/lib/font-size';
import {
  DEFAULT_EXTENSION_PUBLIC_KEY,
  extensionIdFromPublicKey,
  resolveDevExtensionId,
} from '@/lib/extension-identity';
import { enableOpenSidePanelOnActionClick } from '@/lib/side-panel-behavior';
import { createPersistWebExtOptions } from '@/lib/web-ext-options';
import { prepareDevProfile } from '@/scripts/prepare-dev-profile';

describe('font-size', () => {
  it('resolves rem from px using the base size and scale', () => {
    expect(toRem(BASE_FONT_SIZE_PX)).toBe('1rem');
    expect(toRem(24, resolveFontSizeScale('lg'))).toBe('1.6875rem');
  });

  it('applies scale on the document root', () => {
    const root = document.createElement('html');
    applyFontSizeScale('sm', root);
    expect(root.dataset.fontSize).toBe('sm');
    expect(root.style.fontSize).toBe(`${BASE_FONT_SIZE_PX * 0.875}px`);
    expect(isFontSizeScaleName('xl')).toBe(true);
    expect(isFontSizeScaleName('xxl')).toBe(false);
  });

  it('uses md for extension icon UI without exposing a font-size control', () => {
    const root = document.createElement('html');
    applyExtensionUiFontSize(root);
    expect(DEFAULT_FONT_SIZE_SCALE).toBe('md');
    expect(root.dataset.fontSize).toBe('md');
    expect(root.style.fontSize).toBe(`${BASE_FONT_SIZE_PX}px`);
  });
});

describe('dev-profile', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
    );
  });

  it('resolves chrome data dir from env and defaults', () => {
    expect(resolveChromeDataDir({}, '/project')).toBe(
      join('/project', DEFAULT_CHROME_DATA_DIR),
    );
    expect(
      resolveChromeDataDir(
        { [CHROME_DATA_DIR_ENV_KEY]: 'custom-chrome-data' },
        '/project',
      ),
    ).toBe(join('/project', 'custom-chrome-data'));
  });

  it('merges pinned extension ids without duplicates', () => {
    const extensionId = 'abcdefghijklmnopqrstuvwxyzabcdef';
    const once = mergePinnedExtensions({}, extensionId);
    const twice = mergePinnedExtensions(once, extensionId);
    expect(once.extensions?.pinned_extensions).toEqual([extensionId]);
    expect(twice.extensions?.pinned_extensions).toEqual([extensionId]);
  });

  it('writes Preferences when auto-pinning an extension', async () => {
    const chromeDataDir = await mkdtemp(join(tmpdir(), 'wxt-pin-'));
    tempDirs.push(chromeDataDir);
    const extensionId = 'abcdefghijklmnopqrstuvwxyzabcdef';
    const changed = await ensureExtensionPinned(chromeDataDir, extensionId);
    const raw = await readFile(
      join(chromeDataDir, 'Default', 'Preferences'),
      'utf8',
    );
    expect(changed).toBe(true);
    expect(JSON.parse(raw).extensions.pinned_extensions).toEqual([extensionId]);
  });

  it('treats auto-pin as enabled unless explicitly disabled', () => {
    expect(isDevAutoPinEnabled({})).toBe(true);
    expect(isDevAutoPinEnabled({ [DEV_AUTO_PIN_ENV_KEY]: 'false' })).toBe(false);
  });
});

describe('web-ext-options', () => {
  it('persists chromium profile so site logins survive reloads', () => {
    const linux = createPersistWebExtOptions({}, 'linux', '/project');
    expect(linux).toEqual({
      chromiumArgs: [`--user-data-dir=${join('/project', DEFAULT_CHROME_DATA_DIR)}`],
    });

    const windows = createPersistWebExtOptions({}, 'win32', '/project');
    expect(windows).toEqual({
      chromiumProfile: join('/project', DEFAULT_CHROME_DATA_DIR),
      keepProfileChanges: true,
    });
  });
});

describe('side-panel-behavior', () => {
  it('keeps the extension UI open via side panel action click', async () => {
    const calls: Array<{ openPanelOnActionClick: boolean }> = [];
    await enableOpenSidePanelOnActionClick({
      setPanelBehavior: async (options) => {
        calls.push(options);
      },
    });
    expect(calls).toEqual([{ openPanelOnActionClick: true }]);
  });
});

describe('extension-identity', () => {
  it('derives a stable Chrome extension id from the public key', () => {
    expect(extensionIdFromPublicKey(DEFAULT_EXTENSION_PUBLIC_KEY)).toBe(
      'bdbnocmkcnpihofengfoaodnccgkepfb',
    );
    expect(resolveDevExtensionId({})).toBe('bdbnocmkcnpihofengfoaodnccgkepfb');
  });
});

describe('prepare-dev-profile', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
    );
  });

  it('auto-pins the extension when enabled', async () => {
    const chromeDataDir = await mkdtemp(join(tmpdir(), 'wxt-prepare-'));
    tempDirs.push(chromeDataDir);
    const result = await prepareDevProfile({
      [CHROME_DATA_DIR_ENV_KEY]: chromeDataDir,
      [DEV_AUTO_PIN_ENV_KEY]: 'true',
    });
    expect(result.pinned).toBe(true);
    const raw = await readFile(
      join(chromeDataDir, 'Default', 'Preferences'),
      'utf8',
    );
    expect(JSON.parse(raw).extensions.pinned_extensions).toContain(
      result.extensionId,
    );
  });
});
