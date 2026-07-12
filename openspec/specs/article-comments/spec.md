# article-comments Specification

## Purpose
TBD - created by archiving change add-giscus-comments. Update Purpose after archive.
## Requirements
### Requirement: Comment widget on article pages

The system SHALL render a giscus comment widget on every single-article page (`/articles/<slug>`), placed below the article body and its previous/next pager and above the related-articles section. The widget SHALL load entirely on the client from `giscus.app/client.js` with no server runtime, keeping the static export intact.

#### Scenario: Widget appears under an article

- **WHEN** a reader opens any `/articles/<slug>` page
- **THEN** a giscus comment section renders below the article content and pager, and above related articles, without requiring any server request to this site

#### Scenario: Index and non-article pages excluded

- **WHEN** a reader views the `/articles` index, a tag page, or any non-article route
- **THEN** no giscus comment widget is rendered

### Requirement: Discussion mapping by pathname

The system SHALL map each article to its GitHub Discussion using giscus `pathname` mapping, so that a given article URL always resolves to the same discussion thread without per-article configuration.

#### Scenario: Article maps to its own thread

- **WHEN** the widget loads on `/articles/<slug>`
- **THEN** giscus is configured with `data-mapping="pathname"` so comments are bound to that article's URL path and distinct articles get distinct threads

### Requirement: Live theme synchronization

The comment widget SHALL initialize with a custom giscus theme that matches the site color scheme, derived from the site's currently resolved theme (light or dark), and SHALL update the giscus theme live when the site theme changes, without a page reload. The theme value SHALL be a full, origin-derived URL to a site-hosted giscus theme stylesheet (`${origin}/giscus-light.css` or `${origin}/giscus-dark.css`) rather than a built-in `light`/`dark` preset, so the widget palette matches the site and the widget renders as a rounded card in the site design system (like `ProjectCard`: hairline `foreground/10` border, rounded corners, faint fill, crimson inline-code chips, JetBrains Mono).

#### Scenario: Initial theme matches the site

- **WHEN** the widget first loads
- **THEN** its `data-theme` is set to the origin-derived custom theme URL for the resolved site theme (`getResolvedTheme()` in `@/components/layout/ThemeToggle/theme`), `dark` yielding `${origin}/giscus-dark.css` and otherwise `${origin}/giscus-light.css`

#### Scenario: Theme toggle flips the widget

- **WHEN** the reader changes the site theme (manual toggle, or an OS scheme change while on `system`)
- **THEN** the widget receives a `postMessage` `setConfig` update whose `theme` is the origin-derived custom theme URL for the new resolved theme, and re-themes to match with no reload

#### Scenario: Custom theme matches the site palette

- **WHEN** the custom giscus theme stylesheet loads inside the widget
- **THEN** the widget renders as a rounded card in the site design system (like `ProjectCard`: hairline `foreground/10` border, rounded corners, faint fill, crimson inline-code chips), and text, borders, input/comment surfaces, and accent colors match the site palette (`--foreground` and the muted site accent) in both light and dark

### Requirement: Configuration from a single source of truth

The giscus embed parameters SHALL be defined in `src/config/constants.ts` (`giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId`) and read from there by the widget component. These values SHALL NOT be hardcoded in any component.

#### Scenario: Component reads config from constants

- **WHEN** the widget builds the giscus script tag
- **THEN** its `data-repo`, `data-repo-id`, `data-category`, and `data-category-id` values come from `src/config/constants.ts`, with none duplicated inline in the component

### Requirement: Custom theme generated from the site palette

The giscus comment theme stylesheets (`public/giscus-light.css`, `public/giscus-dark.css`) SHALL be generated at build time from the site's color tokens in `src/app/globals.css` (the single source of truth), not hand-authored, so the theme stays in sync with the palette. The generator SHALL run before the Next.js build (chained in the `dev` and `build` npm scripts, like the existing `generate-covers` step), and the two generated files SHALL be gitignored and regenerated each build rather than committed. The generated theme SHALL render the comment card with a faint teal corner glow in the `ProjectCard` motif (soft top-left radial washes of the site's near-background `--section-swell-teal` tint, kept subtle so it does not draw the eye, with a very minimal lift on hover), and SHALL preserve the existing theme behavior (site palette, inverted primary button, rounded write-box card, crimson inline-code chips) in both light and dark.

#### Scenario: Theme regenerates from the palette

- **WHEN** the build runs (or the generator script is run directly)
- **THEN** `public/giscus-light.css` and `public/giscus-dark.css` are produced from the `--background` / `--foreground` / `--section-swell-teal` tokens read out of `src/app/globals.css`, and both files are emitted into the static export

#### Scenario: Changing a palette token updates the theme

- **WHEN** a color token in `src/app/globals.css` changes (e.g. `--foreground`)
- **THEN** the next build regenerates the giscus CSS so its colors match the new token, with no manual edit to the giscus files

#### Scenario: Comment card shows a faint teal corner glow

- **WHEN** the custom theme loads inside the widget on the deployed site
- **THEN** the comment card background shows a faint teal top-left glow (soft radial washes of the near-background `--section-swell-teal` tint) rather than a solid fill, subtle enough not to draw the eye, and it fades up minimally and smoothly on hover (a pseudo-layer `opacity` transition), in both light and dark
