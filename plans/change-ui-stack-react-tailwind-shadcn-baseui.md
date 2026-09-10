# Plan: change UI stack — React + RHF + React Intl + Tailwind + shadcn/ui (Base UI) (2026-09-10)

Goal: replace the Bootstrap side-panel shell with a real React UI using the requested stack, default shadcn designs, no custom design carried over.

Decisions:

- Stack: React (via `@wxt-dev/module-react`), React Hook Form (form), react-intl (formatjs, IntlProvider + existing locale catalogs), Tailwind v4 (`@tailwindcss/vite`), shadcn/ui on **Base UI** primitives with the **default neutral theme** — current design/style.css is dropped, Bootstrap removed.
- shadcn files live in a top-level `ui/` dir (components.json aliases) so the published `lib/` package (tsconfig.lib.json includes `lib/**` only) never ships UI code. All UI deps are devDependencies.
- One source of truth for validation: extract `isSupportedDownloadUrl` (from `download-file.ts` `assertHttpUrl`) and export `resolveSupportedLocale` (from `download/i18n.ts`) so the form reuses the background's exact rules; locale pick is shared between lib i18n and react-intl.
- UI text: extend `locales/{en,zh}.json` with a `sidepanel` namespace; react-intl flattens nested keys (`sidepanel.title`, `download.missingUrl` reused for validation errors).
- The side-panel UI is an authenticated-download form (url, optional filename, credentials-fetch checkbox) calling `requestAuthenticatedDownload` — the template's own feature, giving RHF/i18n/shadcn a real purpose.
- Locale detection: `navigator.language` via shared `resolveSupportedLocale` (zh* → zh, else en). No new env vars needed (business rules stay env-driven in lib).

Steps:

1. ✅ Failing tests first: `isSupportedDownloadUrl` + `resolveSupportedLocale` in `lib/download/__tests__/authenticated-download.test.ts`.
2. ✅ Lib: extract/export the two helpers, re-export from `lib/download/index.ts`.
3. ✅ Deps: removed `bootstrap`/`@types/bootstrap`; added react/react-dom (+types), `@wxt-dev/module-react`, `react-hook-form`, `react-intl`, `tailwindcss`, `@tailwindcss/vite`.
4. ✅ `wxt.config.ts`: `modules: ['@wxt-dev/module-react']`, merged `tailwindcss()` into the vite config.
5. ✅ `components.json` (style `base-nova`, aliases → `@/ui/...`), `shadcn add button input label field card checkbox` (Base UI default; installs `@base-ui/react`, `cn`, `class-variance-authority`, `lucide-react`).
6. ✅ `entrypoints/sidepanel/style.css` → tailwind v4 + shadcn neutral default theme (`@import "shadcn/tailwind.css"` for variants/utilities + theme vars).
7. ✅ Sidepanel: `main.tsx` (createRoot, md font-size), `App.tsx` (IntlProvider), `download-form.tsx` (RHF + shadcn), `i18n.ts` (flat catalogs — react-intl v10 requires flat `Record<string, string>`); deleted `main.ts`.
8. ✅ Locales: added `sidepanel` namespace to en/zh (placeholders, labels, results).
9. ✅ Validated: `pnpm tsc --noEmit` clean; changed tests green (9 passing across the 2 touched files).

Findings from validation:

- `shadcn init` cannot detect WXT as a framework — manual setup was required; the CLI then works fine for `add` once `components.json` exists (style `base-nova` = Base UI; default `new-york`-era styles resolve to Radix).
- react-intl v10 dropped `AbstractIntlMessages`/nested catalogs — nested JSON is flattened to dot-notation ids (`flattenMessages`, unit-tested in `entrypoints/sidepanel/__tests__/i18n.test.ts`; vitest include extended to entrypoints).
- vitest now includes `entrypoints/**/*.test.ts`; the published lib build (`tsconfig.lib.json`) still only compiles `lib/**` + `locales/**`, so no UI code ships.
