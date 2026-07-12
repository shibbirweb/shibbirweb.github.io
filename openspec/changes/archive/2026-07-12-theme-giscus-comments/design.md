## Context

Giscus is embedded via a raw `client.js` script in `src/components/pages/articles/Comments/hooks/useGiscus.ts`. Theme is controlled by `data-theme` (`useGiscus.ts:54`) at load and by a `setConfig` `postMessage` on live theme change (`useGiscus.ts:63`); both read `themeFor()` (`useGiscus.ts:19-21`), which currently returns the preset strings `'light'`/`'dark'`. Those presets render as opaque GitHub Primer panels that do not match the site's muted palette (`--background` `#ededed`/`#0a0a0a`, `--foreground` `#171717`/`#ededed`) or its `.page-gradient` wash (`src/app/globals.css:116-127`).

Giscus supports a **custom theme only as a full URL** to a CSS file, which it applies by injecting a `<link rel="stylesheet">` into its own https iframe (client-side, no server sanitization). The URL must therefore resolve over https. The site is a static export served at `https://shibbir.me` with a `public/` directory whose contents land at the site root, so a theme stylesheet can be hosted there and referenced by URL.

## Goals / Non-Goals

**Goals:**
- Giscus palette matches the site in both light and dark, tracking the manual theme toggle live.
- The widget matches the site design system: one rounded card like `ProjectCard` (hairline `foreground/10` border, `1rem` radius, barely-there fill) with the write box and comments as softer inset cards, crimson inline-code chips, and JetBrains Mono code, in both light and dark.
- No new dependency, no change to the static-export model, minimal code surface.

**Non-Goals:**
- Per-route/per-article accent hue (static CSS cannot know the route; a single fixed site accent is used).
- Switching to the `@giscus/react` package.
- Themed preview on plain http `pnpm dev` (giscus loads the theme stylesheet inside its https iframe, so an http-origin URL is blocked as mixed content; use `pnpm dev:https` or the deployed site).

## Decisions

**1. Host two custom stylesheets in `public/` (`giscus-light.css`, `giscus-dark.css`).**
Rationale: the site drives theme via a `data-theme` attribute and manual toggle, and giscus applies exactly the one CSS URL it is given. Two files map cleanly onto the existing `light`/`dark` branch in `themeFor()` and keep each file a self-contained override. Alternative considered: a single file using `@media (prefers-color-scheme)`, rejected because the giscus iframe is a separate document that does not carry the site's `data-theme`, so it could not honor the manual toggle, only OS preference.

**2. Base each file on giscus's official template, then override Primer variables.**
Base each file on giscus's Primer variables, then override to match the site design system (`ProjectCard`, `Tag`, and `ArticleContent.module.css`): give `main` one rounded card (barely-there `foreground/2.5%` fill, `1rem` radius, `foreground/10` border, padding) with `--color-canvas-default` transparent so the write box and comments read as softer inset cards via `--color-canvas-inset` / `--color-canvas-subtle` (`foreground/5%` / `foreground/3.5%`); `--color-fg-default` / `--color-fg-muted` (site foreground and a ~65% tint); hairline borders matching `border-foreground/10`; crimson `#e01e5a` inline-code chips and a bordered `0.75rem`-radius code block in JetBrains Mono; and a single muted indigo accent (`--color-accent-fg`, `--color-accent-emphasis`, `--color-btn-primary-bg`) from the site gradient tone (`pageGradient.ts` uses `hsl(<hue> 35% 52%)`; one fixed hue, lifted for contrast in dark). Keep files self-contained: no `@import`, no external `url()`.

**3. `themeFor()` returns an origin-derived URL.**
Change the return to `` `${window.location.origin}/giscus-${mode}.css` `` where `mode` is `dark` when `getResolvedTheme() === 'dark'` else `light`. Rationale: `useGiscus` runs in a client effect so `window.location.origin` is available; prod yields `https://shibbir.me/giscus-<mode>.css`, dev yields the local origin, each without hardcoding. The value flows unchanged into both existing wire points (the `data-theme` attribute and the `setConfig` postMessage), so live toggling and cross-tab/OS-flip subscription (`theme.ts:88-102`) keep working with only the value changed. Alternative considered: hardcode `siteURL` from constants, rejected because it would always point at prod and never reflect the current origin in other environments.

## Risks / Trade-offs

- **Giscus loads the theme as a `<link rel="stylesheet">` inside its https iframe, so an http-origin URL is blocked as mixed content** → plain http `pnpm dev` shows the unstyled default; preview over `pnpm dev:https` or on the deployed https site. Confirmed via `net::ERR_FAILED` on the http theme request in a headless load.
- **Card fill/borders must stay legible and on-brand against the article page** → surfaces reuse the site's own design tokens (`foreground/*` fills and borders) with full-strength site foreground; verified legible in both themes via CSS injected into the real giscus frame.
- **A missing/misnamed CSS file makes giscus fall back or render unstyled** → confirm `https://shibbir.me/giscus-<mode>.css` returns `200 text/css` and both files are emitted into `./out` by `pnpm build`.
- **Future giscus template changes could drift from the copied base** → the override set is small and variable-based, so re-basing is low effort if needed.
