## ADDED Requirements

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

The comment widget SHALL initialize with the site's currently resolved theme (light or dark) and SHALL update the giscus theme live when the site theme changes, without a page reload.

#### Scenario: Initial theme matches the site

- **WHEN** the widget first loads
- **THEN** its `data-theme` is set from the resolved site theme (`getResolvedTheme()` in `@/components/layout/ThemeToggle/theme`), `dark` yielding the dark giscus theme and otherwise the light one

#### Scenario: Theme toggle flips the widget

- **WHEN** the reader changes the site theme (manual toggle, or an OS scheme change while on `system`)
- **THEN** the widget receives a `postMessage` `setConfig` update and re-themes to match, with no reload

### Requirement: Configuration from a single source of truth

The giscus embed parameters SHALL be defined in `src/config/constants.ts` (`giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId`) and read from there by the widget component. These values SHALL NOT be hardcoded in any component.

#### Scenario: Component reads config from constants

- **WHEN** the widget builds the giscus script tag
- **THEN** its `data-repo`, `data-repo-id`, `data-category`, and `data-category-id` values come from `src/config/constants.ts`, with none duplicated inline in the component
