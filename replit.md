# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/mobile` (`@workspace/mobile`) — GreenScope AI

Expo / React Native mobile app — fully bilingual (English + Arabic), with proper LTR / RTL switching driven by user choice.

**Internationalization (i18n)**
- `context/I18nContext.tsx` exposes `{ lang, setLang, t, isRTL }`. `lang` is `'en' | 'ar'`, persisted in AsyncStorage key `greenscope_language`. Default is `'en'`. `isRTL = lang === 'ar'`. The `translations` table holds parallel `en` and `ar` dictionaries with the same keys; `TranslationKeys` is derived from `typeof translations.en` so missing Arabic translations fail at compile time.
- `<I18nProvider>` is wired in `app/_layout.tsx` inside `<ThemeProvider>`, before any screens.
- The Settings screen has a Language toggle that calls `setLang('en' | 'ar')` and immediately re-renders all subscribed screens.
- Every user-facing screen calls `useI18n()` and uses `t('keyName')` instead of literal strings, including alerts, placeholders, buttons, badges, modals, and section titles.
- Localized screens: `auth.tsx`, `(tabs)/index.tsx`, `(tabs)/garden.tsx`, `(tabs)/favorites.tsx`, `(tabs)/scan.tsx`, `(tabs)/settings.tsx`, `report.tsx`, `admin/api-keys.tsx`, `admin/users.tsx`.

**RTL handling pattern**
The `makeStyles` factory accepts `isRTL` and produces direction-aware styles:
```ts
const { mode } = useTheme();
const { isRTL } = useI18n();
const styles = useMemo(() => makeStyles(isRTL), [mode, isRTL]);
// ...
function makeStyles(isRTL: boolean) {
  return StyleSheet.create({
    row: { flexDirection: isRTL ? 'row-reverse' : 'row' },
    label: { textAlign: isRTL ? 'right' : 'left' },
  });
}
```
Back-arrow icons flip via `isRTL ? 'arrow-forward' : 'arrow-back'`. Date strings use `toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')`. Helper components inside the same file (e.g., `NutritionRow`, `ToolCard`, `SectionCard` in `report.tsx`) re-derive their own `styles` via the same hook pattern — top-level module styles cannot read `isRTL`.

**AI plant report localization**
The Gemini scan endpoint (`artifacts/api-server/src/routes/plants/scan.ts`) accepts a `lang: 'en' | 'ar'` field on `POST /api/plants/scan`. It branches between `ENGLISH_PROMPT` and `ARABIC_PROMPT`; both prompts enforce the exact same JSON shape but instruct the model to write all text values (plant name, description, benefits, care, nutrition labels, soil ingredients, warning notes, community alerts, safety values `Safe|Caution|Unsafe` vs `آمن|حذر|غير آمن`) in the requested language. The mobile scan screen reads `lang` from `useI18n()` and forwards it in the request body. Cached scans keep their original language; only newly scanned reports follow the current language setting.

**Theming / Dark Mode**
- `constants/colors.ts` exports a dual-palette system: `lightPalette` and `darkPalette` (dark = #0A0F0D background, #141A16 surface, #22C55E primary, white text, green-tinted borders, green glow shadows). Default `Colors` export is a Proxy reading the mutable `currentPalette`. Helpers: `setColorMode(mode)`, `getCurrentMode()`, `getPalette(mode)`, type `Palette`. Extra keys: `inputBg`, `glow`.
- `context/ThemeContext.tsx` provides `{ mode, setMode, toggleMode, isDark, palette }`, persists choice in AsyncStorage key `greenscope_theme`, hydrates before rendering, and calls `setColorMode` on hydrate/change.
- `<ThemeProvider>` is wired in `app/_layout.tsx` (wraps `I18nProvider`).
- The Settings screen has a Dark Mode toggle (Switch) bound to `toggleMode`, with EN/AR On/Off labels.

**Critical pattern — `makeStyles` factory**
`StyleSheet.create` freezes color values at call time, so the Proxy alone won't update existing stylesheets. Every screen / helper component that uses themed styles must:
```ts
const { mode } = useTheme();
const styles = useMemo(() => makeStyles(), [mode]);
// ...
function makeStyles() { return StyleSheet.create({ ... }); }
```
Already converted: `(tabs)/_layout.tsx`, `(tabs)/settings.tsx`, `(tabs)/index.tsx`, `(tabs)/garden.tsx`, `(tabs)/favorites.tsx`, `(tabs)/scan.tsx`, `auth.tsx`, `report.tsx`, `admin/api-keys.tsx`, `admin/users.tsx`, plus in-file helper components (PlantCard, FavoriteCard, SettingRow). When adding new themed screens, follow the same factory pattern.

**Color usage rules**
- Card / surface backgrounds → `Colors.surface` (NOT `Colors.white`).
- Page backgrounds → `Colors.background`.
- Borders → `Colors.border` or `Colors.cardBorder`.
- Text on gradients / colored buttons that should always stay white → `Colors.white` (semantic, stays #FFFFFF in both modes).
- Green button shadows → `Colors.glow`.
- Brand / status colors (favorites #E91E63, paid badge #1E88E5, severity palettes) are intentionally hardcoded and not themed.
