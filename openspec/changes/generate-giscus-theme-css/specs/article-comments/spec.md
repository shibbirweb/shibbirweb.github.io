## MODIFIED Requirements

### Requirement: Custom theme generated from the site palette

The giscus comment theme stylesheets (`public/giscus-light.css`,
`public/giscus-dark.css`) SHALL be generated at build time from the site's color
tokens in `src/app/globals.css` (the single source of truth), not hand-authored,
so the theme stays in sync with the palette. The generator SHALL run before the
Next.js build (chained in the `dev` and `build` npm scripts, like the existing
`generate-covers` step), and the two generated files SHALL be gitignored and
regenerated each build rather than committed. The generated theme SHALL render the
comment card on a gradient background matching the site (background to
`--section-swell-indigo` to background), and SHALL preserve the existing theme
behavior (site palette, inverted primary button, rounded write-box card, crimson
inline-code chips) in both light and dark.

#### Scenario: Theme regenerates from the palette

- **WHEN** the build runs (or the generator script is run directly)
- **THEN** `public/giscus-light.css` and `public/giscus-dark.css` are produced from
  the `--background` / `--foreground` / `--section-swell-indigo` tokens read out of
  `src/app/globals.css`, and both files are emitted into the static export

#### Scenario: Changing a palette token updates the theme

- **WHEN** a color token in `src/app/globals.css` changes (e.g. `--section-swell-indigo`)
- **THEN** the next build regenerates the giscus CSS so its colors (including the
  gradient stop) match the new token, with no manual edit to the giscus files

#### Scenario: Comment card shows a theme gradient

- **WHEN** the custom theme loads inside the widget on the deployed site
- **THEN** the comment card background is a vertical gradient (background to
  `--section-swell-indigo` to background) rather than a solid fill, matching the
  site's section-swell / page-gradient motif, in both light and dark
