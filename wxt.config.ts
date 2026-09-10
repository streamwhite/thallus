import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import {
  createDevViteWatchConfig,
  resolveDevReloadOptions,
} from './lib/dev-reload';
import { resolveExtensionPublicKey } from './lib/extension-identity';
import { createPersistWebExtOptions } from './lib/web-ext-options';
import { prepareDevProfile } from './scripts/prepare-dev-profile';

const EXTENSION_NAME = 'Extension Dev Template';
const EXTENSION_DESCRIPTION =
  'WXT template for building browser extensions with persistent dev sessions';

const devReload = resolveDevReloadOptions();

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: EXTENSION_NAME,
    description: EXTENSION_DESCRIPTION,
    action: {},
    permissions: ['downloads'],
    key: resolveExtensionPublicKey(),
  },
  webExt: createPersistWebExtOptions(),
  dev: {
    reloadCommand: devReload.reloadCommand,
  },
  vite: () => ({
    ...createDevViteWatchConfig(devReload),
    plugins: [tailwindcss()],
  }),
  hooks: {
    'build:done': async (wxt) => {
      if (wxt.config.command !== 'serve') {
        return;
      }
      try {
        await prepareDevProfile();
      } catch (error) {
        console.error('Dev profile preparation failed', error);
      }
    },
  },
});
