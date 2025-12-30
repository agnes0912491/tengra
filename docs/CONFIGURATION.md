# Configuration

This document summarizes configuration files and key entries.

## `.env`
Keys: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_CDN_URL, NEXT_PUBLIC_VERSION, NEXT_PUBLIC_GFC_ID, NEXT_PUBLIC_RECAPTCHA_SITE_KEY, NEXT_PUBLIC_FORUM_FRONTEND_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID

## `.env.example`
Keys: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_CDN_URL, NEXT_PUBLIC_VERSION, NEXT_PUBLIC_GFC_ID, NEXT_PUBLIC_RECAPTCHA_SITE_KEY, NEXT_PUBLIC_FORUM_FRONTEND_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID

## `.github/workflows/ci.yml`
Top-level keys: name, on, permissions, jobs

## `components.json`
Top-level keys: $schema, style, rsc, tsx, tailwind, iconLibrary, aliases, registries

## `eslint.config.mjs`
Keys: see file for details.

## `next.config.ts`
Keys: see file for details.

## `package.json`
Top-level keys: name, version, private, scripts, dependencies, devDependencies, overrides, scripts: build, dev, lint, start

## `postcss.config.mjs`
Keys: see file for details.

## `public/manifest.json`
Top-level keys: name, short_name, icons, start_url, display, background_color, theme_color

## `tailwind.config.ts`
Keys: see file for details.

## `tsconfig.json`
Top-level keys: compilerOptions, include, exclude

## Notes
- Keep secrets out of the repo; use `.env` for local overrides.
- Prefer documenting new keys here when added.

## Examples
- Example environment key: `EXAMPLE_FEATURE_FLAG=true`.
- Example config entry: `port: 3000` in a YAML config.

## Edge Cases
- Missing `.env` values fall back to defaults if defined in code.
- JSON configs should remain valid; trailing commas will break parsing.
