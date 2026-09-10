# Plan: publish lib/ as an installable npm package (2026-09-10)

Goal: others can `pnpm add extension-dev-template` and use the lib/ utilities; the repo stays a working WXT extension acting as the demo consumer.

Decisions:

- Publish all of `lib/` via a single entry barrel `lib/index.ts` (ESM only, `dist/lib/index.js` + `.d.ts`).
- Build with plain `tsc` (`tsconfig.lib.json`, no `.wxt` dependency, rootDir `.`) — zero new build deps; emits `dist/lib/**` + `dist/locales/**`.
- lib-internal imports converted from `@/…` alias to relative (tsc cannot rewrite path aliases); tests/entrypoints keep the alias (WXT resolves it).
- `register-handler` / `request-download` now import `browser` from `wxt/browser` explicitly; `wxt` is a peer dependency (`>=0.20.0`).
- `postinstall: wxt prepare` removed (would break library consumers) — folded into `test`/`compile` scripts; `wxt dev`/`build` self-prepare.
- `bootstrap` moved to devDependencies (bundled by vite at build time, not a runtime dep of the library).
- New dev dep `@types/node` (needed so `NodeJS.ProcessEnv`/`NodeJS.Platform` resolve in the standalone lib build).
- Package: un-private, version 0.1.0, `files: [dist, README.md]`, `sideEffects: false`, `prepublishOnly` builds dist. Name verified free on npm.

Steps:

1. Convert lib imports to relative + explicit `wxt/browser` imports. ✅
2. Add `lib/index.ts` barrel, `tsconfig.lib.json`, `README.md`. ✅
3. Rewrite `package.json` (exports/files/peerDeps/scripts), add `dist` to `.gitignore`. ✅
4. Validate: `pnpm install`, `pnpm test`, `pnpm build:lib`, inspect `dist/`, `pnpm pack --dry-run`. ✅

Findings from validation:

- `tsc` auto-emits `dist/locales/*.json` (no copy step needed).
- `.gitignore`'d `dist/` was silently dropped from the tarball despite the `files` whitelist (npm/pnpm packing quirk) — fixed by adding `.npmignore` that does not ignore `dist`.
- Emitted ESM keeps extensionless relative imports (`./constants`), so the entry must be consumed via a bundler (WXT/vite) — fine for this audience since the entry also imports `wxt/browser`. Upgrade path if plain-Node ESM is ever needed: `.ts`-suffixed imports + `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` in `tsconfig.lib.json`.
- Added `lib/__tests__/package-build.test.ts`: imports the built `dist/lib/index.js` through vite (the real consumer path); auto-skips when `dist/` is absent; wired into `prepublishOnly`.

