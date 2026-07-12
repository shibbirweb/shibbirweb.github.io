## 1. Custom theme stylesheets

- [x] 1.1 Create `public/giscus-light.css` based on giscus's official `light` theme template, keeping it self-contained (no `@import`, no external `url()`)
- [x] 1.2 In `giscus-light.css`, style `main` as one rounded card like `ProjectCard` (faint `foreground/2.5%` fill, `1rem` radius, `foreground/10` border, padding) with `--color-canvas-default` transparent and `--color-canvas-inset` / `--color-canvas-subtle` faint `foreground` tints for the write box and comments, hairline `foreground/10` borders, crimson `#e01e5a` inline-code chips, and a bordered `0.75rem`-radius code block
- [x] 1.3 In `giscus-light.css`, override text (`--color-fg-default` `#171717`, `--color-fg-muted` ~70% tint), borders (match `border-foreground/10`), and a single muted site accent (`--color-accent-fg`, `--color-accent-emphasis`, `--color-btn-primary-bg`) in the indigo/blue swell hue
- [x] 1.4 Create `public/giscus-dark.css` the same way with the dark palette (`--color-fg-default` `#ededed`, faint `foreground/3%` card fill, `foreground/10` border, faint inset tints, dark-tuned accent and borders)
- [x] 1.5 (Optional) Set a font-family stack approximating Noto Sans (body) and JetBrains Mono (code) in both files

## 2. Point the widget at the custom theme

- [x] 2.1 Edit `themeFor()` in `src/components/pages/articles/Comments/hooks/useGiscus.ts` to return `` `${window.location.origin}/giscus-${mode}.css` `` where `mode` is `dark` when `getResolvedTheme() === 'dark'` else `light`
- [x] 2.2 Confirm the initial `data-theme` set (`useGiscus.ts:54`) and the live `setConfig` postMessage (`useGiscus.ts:63`) both consume the new URL unchanged

## 3. Verify

- [x] 3.1 Run `pnpm lint` and `pnpm build`; confirm the build succeeds and both `giscus-*.css` files are emitted into `./out`
- [x] 3.2 Assert `themeFor()` returns the expected origin URL, and confirm `${origin}/giscus-dark.css` resolves to `200 text/css` (verified the http path is blocked as mixed content and the https path loads the stylesheet inside the giscus iframe)
- [ ] 3.3 On the deployed https site or `pnpm dev:https` (plain http dev blocks the theme stylesheet as mixed content), open an article and confirm: `ProjectCard`-style rounded card, palette matches in light and dark, and toggling the site theme re-themes giscus live with no reload
