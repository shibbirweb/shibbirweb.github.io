## 1. Generator script

- [x] 1.1 Create `scripts/generate-giscus-themes.ts` (a `tsx` script ending in a top-level `main()`, mirroring `scripts/generate-covers.ts`)
- [x] 1.2 Parse `src/app/globals.css`: extract `--background` and `--foreground` from the `:root {` block (light) and the `:root[data-theme='dark'] {` block (dark); throw if any token is missing
- [x] 1.3 Add a `hex -> {r,g,b}` helper and a `buildGiscusTheme(palette, mode)` that returns the full CSS string: the 73 Primer `--color-*` variables (foreground-tinted rgba surfaces/borders/buttons, inverted primary button, `hsl(234 ...)` accent, static GitHub prettylights maps) plus the element rules (textarea top radius, `-extras` bottom radius, `.btn-primary` radius/weight, crimson inline code, code block)
- [x] 1.4 In the `main` block, set the ProjectCard corner-aurora glow: three top-left `radial-gradient` washes (`color-mix(in oklab, oklch(0.72 0.16 <hue>) <strength>%, transparent)`, cool blue/indigo/violet hues) over `background-color: <background>`, plus a `main:hover` rule that raises the strength; keep the `foreground/10` border, `1rem` radius, and padding
- [x] 1.5 Write `public/giscus-light.css` and `public/giscus-dark.css` with `fs.writeFileSync`

## 2. Wire into build + tracking

- [x] 2.1 In `package.json`, chain `tsx scripts/generate-giscus-themes.ts` into the `dev` and `build` scripts (before `next dev` / `next build`)
- [x] 2.2 Add `/public/giscus-light.css` and `/public/giscus-dark.css` to `.gitignore`
- [x] 2.3 `git rm --cached public/giscus-light.css public/giscus-dark.css` (stop tracking the now-generated files)

## 3. Verify

- [x] 3.1 Run `pnpm exec tsx scripts/generate-giscus-themes.ts`; diff the regenerated files against the previous versions, only the `main` background (aurora glow) should differ
- [x] 3.2 Single-source proof: change `--foreground` in `globals.css`, re-run the generator, confirm the giscus text/tint colors update; revert the token
- [x] 3.3 `pnpm lint` + `pnpm build` succeed; both `giscus-*.css` are emitted into `./out`
- [x] 3.4 Inject the generated CSS into the real giscus frame headless and screenshot: confirm the aurora glow renders and the button / input radius / palette are unchanged in light and dark
- [ ] 3.5 Deploy verification (authoritative, localhost cannot render the theme): open a live article, confirm the comment card shows the ProjectCard aurora glow (strengthened on hover) in both light and dark and matches the site
