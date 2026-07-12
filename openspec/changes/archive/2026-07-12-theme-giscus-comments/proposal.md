## Why

The giscus comment widget on article pages currently loads GitHub's stock `light`/`dark` presets, opaque Primer-blue panels that clash with the site's muted, monochrome-plus-gradient look. The comment section should match the site color scheme and render as a rounded card in the site design system (like `ProjectCard`), in both light and dark.

## What Changes

- Add two self-contained custom giscus theme stylesheets in `public/` (`giscus-light.css`, `giscus-dark.css`) that override Primer color variables to the site palette (`--background` / `--foreground`), set a muted site accent for links/buttons/reactions, and render the widget as a rounded card in the site design system (like `ProjectCard`: hairline `foreground/10` border, `1rem` radius, faint fill, softer inset boxes, crimson inline-code chips, JetBrains Mono).
- Change the widget's theme value from a preset string to a full, origin-derived URL to the matching stylesheet, so `data-theme` (initial) and the live `setConfig` postMessage both point at the custom theme.
- Keep light/dark selection and live theme-toggle synchronization behavior intact; only the value handed to giscus changes (preset string becomes `${origin}/giscus-<mode>.css`).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-comments`: the "Live theme synchronization" requirement changes so the widget theme is a custom, origin-derived giscus theme-CSS URL matching the site palette (rounded card in the site design system, like `ProjectCard`), rather than the built-in `light`/`dark` presets, while still initializing from the resolved site theme and re-theming live on toggle.

## Impact

- New static assets: `public/giscus-light.css`, `public/giscus-dark.css` (served at site root; included in the `./out` static export).
- Modified code: `themeFor()` in `src/components/pages/articles/Comments/hooks/useGiscus.ts` returns the URL; the two existing wire points (`data-theme` attribute and `setConfig` postMessage) are unchanged in structure.
- No new dependencies, no config changes, no impact on the static export (theme CSS is a plain static file; giscus loads it client-side from a public URL).
- Constraint: giscus applies the theme via a `<link rel="stylesheet">` inside its https iframe, so the URL must be https. Production and `pnpm dev:https` work; plain http `pnpm dev` blocks the http-origin stylesheet as mixed content and the widget renders unstyled. Verification is authoritative on the deployed site (or `pnpm dev:https`).
