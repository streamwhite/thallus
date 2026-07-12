import { defineConfig } from 'wxt';
import { resolveExtensionPublicKey } from './lib/extension-identity';
import { createPersistWebExtOptions } from './lib/web-ext-options';
import { prepareDevProfile } from './scripts/prepare-dev-profile';

const EXTENSION_NAME = 'Extension Dev Template';
const EXTENSION_DESCRIPTION =
  'WXT template for building browser extensions with persistent dev sessions';

export default defineConfig({
  manifest: {
    name: EXTENSION_NAME,
    description: EXTENSION_DESCRIPTION,
    action: {},
    key: resolveExtensionPublicKey(),
  },
  webExt: createPersistWebExtOptions(),
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
