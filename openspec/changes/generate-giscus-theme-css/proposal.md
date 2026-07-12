## Why

The giscus comment theme lives in two hand-authored, committed files
(`public/giscus-light.css`, `public/giscus-dark.css`) that duplicate the site
palette hexes already defined in `src/app/globals.css`, so they drift when the
palette changes. And the comment card background is a flat solid fill rather than a
faint neutral tonal glow matched to the card (a ProjectCard-style corner wash),
kept subtle so it does not draw the eye.

## What Changes

- Add a build-time generator (`scripts/generate-giscus-themes.ts`, run with `tsx`)
  that reads the palette tokens from `src/app/globals.css` (the single source) and
  emits `public/giscus-light.css` and `public/giscus-dark.css`, so the theme stays
  in sync with the site colors automatically.
- Give the giscus card a faint neutral corner glow in the `ProjectCard` motif (soft
  top-left radial washes of the foreground tone, no color, with a very subtle lift
  on hover), replacing the solid fill.
- Chain the generator into the `dev` and `build` npm scripts, gitignore the two
  generated files, and remove their committed copies from tracking (following the
  repo convention for generated `public/` assets such as `/public/og/`).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-comments`: the custom giscus theme is now generated at build time from
  the site's `globals.css` palette (single source of truth) instead of committed
  hardcoded CSS, and the comment card renders a faint neutral corner glow (subtle
  lift on hover) rather than a solid fill.

## Impact

- New script `scripts/generate-giscus-themes.ts`; `package.json` `dev`/`build`
  chains gain a `tsx scripts/generate-giscus-themes.ts` step.
- `public/giscus-light.css` / `public/giscus-dark.css` become generated output:
  added to `.gitignore` and removed from git tracking; regenerated each build and
  emitted into `./out` by the static export.
- No new runtime dependency, no change to `useGiscus.ts` (still reads
  `${origin}/giscus-<mode>.css`) or the comment component. Static-export model
  unchanged: the generator runs before `next build`, exactly like the existing
  `generate-covers` / `prepare-resume` steps.
- Constraint unchanged: giscus loads the theme as a crossorigin stylesheet in its
  public https iframe, so it only renders from a public URL (the deployed
  `https://shibbir.me`), not over localhost.
