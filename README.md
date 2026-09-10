# extension-dev-template

Reusable helpers for [WXT](https://wxt.dev) browser extensions, plus a working dev template that consumes them:

- **Authenticated downloads** — download files through the background service worker using the browser's session cookies (`registerAuthenticatedDownloadHandler` / `requestAuthenticatedDownload`).
- **Side-panel behavior** — open the side panel on action click.
- **Font-size scales** — rem helpers with `sm`/`md`/`lg`/`xl` scales.
- **Dev tooling** — stable extension IDs, persistent Chromium dev profiles (logins survive reloads), and HMR-friendly watch config for `wxt.config.ts`.

## Install

```sh
pnpm add extension-dev-template
```

Requires `wxt` (peer dependency, `>=0.20.0`) — the download helpers import `browser` from `wxt/browser`.

> Note: the package ships ESM with extensionless relative imports, intended to be consumed through a bundler (WXT/vite/webpack/esbuild all resolve these). Plain Node ESM `import` of the entry is not supported — the entry also imports `wxt/browser`, which only exists inside an extension build.

## Usage

Background entrypoint:

```ts
import { registerAuthenticatedDownloadHandler } from 'extension-dev-template';

export default defineBackground(() => {
  registerAuthenticatedDownloadHandler();
});
```

Anywhere in your extension (content script, popup, side panel):

```ts
import { requestAuthenticatedDownload } from 'extension-dev-template';

const result = await requestAuthenticatedDownload({
  url: 'https://example.com/report.pdf',
  filename: 'report.pdf', // optional, derived from the URL when omitted
  useCredentialsFetch: true, // fetch with session cookies, then save the blob
});
```

Add the `downloads` permission to your manifest. Download defaults can be tuned with env vars:

| Env var | Purpose | Default |
| --- | --- | --- |
| `WXT_DOWNLOAD_CONFLICT_ACTION` | `uniquify` \| `overwrite` \| `prompt` | `uniquify` |
| `WXT_DOWNLOAD_SAVE_AS` | Show the save-as dialog | `false` |
| `WXT_DOWNLOAD_USE_CREDENTIALS_FETCH` | Fetch with credentials by default | `false` |

Dev tooling (used in `wxt.config.ts`): `resolveDevReloadOptions`, `createDevViteWatchConfig`, `resolveExtensionPublicKey`, `createPersistWebExtOptions`, `prepareDevProfile` — see this repo's `wxt.config.ts` for a live example.

## Development

This repo is both the library and a WXT extension that uses it.

Side-panel UI stack: React (`@wxt-dev/module-react`), React Hook Form, React Intl (formatjs), Tailwind CSS v4, and shadcn/ui on Base UI with the default design. UI code lives in `entrypoints/sidepanel/` and `ui/`; add more shadcn components with `pnpm dlx shadcn@latest add <component>`.

```sh
pnpm install
pnpm test        # run vitest
pnpm dev         # run the extension (also generates .wxt types)
pnpm build:lib   # build the publishable library into dist/
pnpm pack        # preview the published tarball
```

## Publishing

```sh
pnpm publish     # prepublishOnly builds dist/ first
```
